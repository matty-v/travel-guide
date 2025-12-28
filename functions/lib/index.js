"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const storage_1 = require("@google-cloud/storage");
const uuid_1 = require("uuid");
const busboy_1 = __importDefault(require("busboy"));
const app = (0, express_1.default)();
// CORS must be first
app.use((0, cors_1.default)());
// GCS Configuration
const storage = new storage_1.Storage();
const BUCKET_NAME = process.env.GCS_BUCKET || 'travel-guide-data';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
// Auth middleware (doesn't consume body)
function requireAdminHeader(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    next();
}
// Helper functions
async function getCountriesIndex() {
    try {
        const file = storage.bucket(BUCKET_NAME).file('countries.json');
        const [exists] = await file.exists();
        if (!exists) {
            return [];
        }
        const [contents] = await file.download();
        return JSON.parse(contents.toString());
    }
    catch {
        return [];
    }
}
async function saveCountriesIndex(countries) {
    const file = storage.bucket(BUCKET_NAME).file('countries.json');
    await file.save(JSON.stringify(countries, null, 2), {
        contentType: 'application/json',
    });
}
async function getCountryConfig(slug) {
    const countries = await getCountriesIndex();
    return countries.find((c) => c.slug === slug) || null;
}
// ============================================
// FILE UPLOAD ROUTE - MUST BE BEFORE BODY PARSERS
// ============================================
app.post('/admin/upload/:countrySlug/*', requireAdminHeader, (req, res) => {
    const { countrySlug } = req.params;
    const contentPath = req.params[0];
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }
    const busboy = (0, busboy_1.default)({ headers: req.headers });
    let fileBuffer = null;
    let fileMimetype = '';
    let fileOriginalName = '';
    busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;
        fileOriginalName = filename;
        fileMimetype = mimeType;
        const chunks = [];
        file.on('data', (chunk) => {
            chunks.push(chunk);
        });
        file.on('end', () => {
            fileBuffer = Buffer.concat(chunks);
        });
    });
    busboy.on('finish', async () => {
        try {
            if (!fileBuffer) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const isPdf = fileMimetype === 'application/pdf';
            const isDocx = fileMimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            if (!isPdf && !isDocx) {
                return res.status(400).json({ error: 'Only PDF and DOCX files are allowed' });
            }
            if (!isPdf) {
                return res.status(400).json({
                    error: 'DOCX conversion is not yet implemented. Please upload a PDF file.'
                });
            }
            // Ensure the file path ends with .pdf
            const finalPath = contentPath.endsWith('.pdf') ? contentPath : `${contentPath}.pdf`;
            const gcsFile = storage.bucket(BUCKET_NAME).file(`${countrySlug}/${finalPath}`);
            await gcsFile.save(fileBuffer, {
                contentType: 'application/pdf',
                metadata: {
                    originalName: fileOriginalName,
                },
            });
            res.json({ success: true, path: `${countrySlug}/${finalPath}` });
        }
        catch (error) {
            console.error('Error uploading file:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    });
    busboy.on('error', (error) => {
        console.error('Busboy error:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to parse upload: ' + error.message });
    });
    req.on('error', (error) => {
        console.error('Request error:', error.message);
    });
    console.log('Starting file upload, content-type:', contentType);
    console.log('Request readable:', req.readable);
    // Check if rawBody is available (Cloud Functions buffers the body)
    const rawBody = req.rawBody;
    if (rawBody) {
        console.log('Using rawBody, length:', rawBody.length);
        busboy.end(rawBody);
    }
    else {
        console.log('Piping request stream');
        req.pipe(busboy);
    }
});
// ============================================
// BODY PARSERS - AFTER FILE UPLOAD ROUTE
// ============================================
app.use(express_1.default.json());
app.use(express_1.default.text({ type: 'text/markdown' }));
// Auth middleware for routes that need body parsing
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    if (token !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    next();
}
// ============================================
// ROUTES
// ============================================
// GET /countries - List all countries
app.get('/countries', async (_req, res) => {
    try {
        const countries = await getCountriesIndex();
        res.json(countries);
    }
    catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).json({ error: 'Failed to fetch countries' });
    }
});
// GET /countries/:slug - Get country details
app.get('/countries/:slug', async (req, res) => {
    try {
        const country = await getCountryConfig(req.params.slug);
        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }
        res.json(country);
    }
    catch (error) {
        console.error('Error fetching country:', error);
        res.status(500).json({ error: 'Failed to fetch country' });
    }
});
// GET /content/:countrySlug/:contentPath - Fetch markdown content
app.get('/content/:countrySlug/*', async (req, res) => {
    try {
        const { countrySlug } = req.params;
        const contentPath = req.params[0];
        const file = storage.bucket(BUCKET_NAME).file(`${countrySlug}/${contentPath}`);
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).json({ error: 'Content not found' });
        }
        const [metadata] = await file.getMetadata();
        const [contents] = await file.download();
        res.set({
            'Content-Type': 'text/markdown',
            ETag: metadata.etag,
            'Last-Modified': metadata.updated,
        });
        res.send(contents.toString());
    }
    catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ error: 'Failed to fetch content' });
    }
});
// POST /admin/login - Validate admin password
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    }
    else {
        res.status(401).json({ error: 'Invalid password' });
    }
});
// POST /admin/countries - Create country
app.post('/admin/countries', requireAdmin, async (req, res) => {
    try {
        const countries = await getCountriesIndex();
        const newCountry = {
            id: (0, uuid_1.v4)(),
            ...req.body,
        };
        if (countries.some((c) => c.slug === newCountry.slug)) {
            return res.status(400).json({ error: 'Country slug already exists' });
        }
        countries.push(newCountry);
        await saveCountriesIndex(countries);
        res.status(201).json(newCountry);
    }
    catch (error) {
        console.error('Error creating country:', error);
        res.status(500).json({ error: 'Failed to create country' });
    }
});
// PUT /admin/countries/:slug - Update country
app.put('/admin/countries/:slug', requireAdmin, async (req, res) => {
    try {
        const countries = await getCountriesIndex();
        const index = countries.findIndex((c) => c.slug === req.params.slug);
        if (index === -1) {
            return res.status(404).json({ error: 'Country not found' });
        }
        countries[index] = { ...countries[index], ...req.body };
        await saveCountriesIndex(countries);
        res.json(countries[index]);
    }
    catch (error) {
        console.error('Error updating country:', error);
        res.status(500).json({ error: 'Failed to update country' });
    }
});
// DELETE /admin/countries/:slug - Delete country
app.delete('/admin/countries/:slug', requireAdmin, async (req, res) => {
    try {
        const countries = await getCountriesIndex();
        const filtered = countries.filter((c) => c.slug !== req.params.slug);
        if (filtered.length === countries.length) {
            return res.status(404).json({ error: 'Country not found' });
        }
        await saveCountriesIndex(filtered);
        // Optionally delete country folder from GCS
        const [files] = await storage.bucket(BUCKET_NAME).getFiles({
            prefix: `${req.params.slug}/`,
        });
        await Promise.all(files.map((file) => file.delete()));
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting country:', error);
        res.status(500).json({ error: 'Failed to delete country' });
    }
});
// PUT /admin/content/:countrySlug/:contentPath - Save markdown content
app.put('/admin/content/:countrySlug/*', requireAdmin, async (req, res) => {
    try {
        const { countrySlug } = req.params;
        const contentPath = req.params[0];
        const file = storage.bucket(BUCKET_NAME).file(`${countrySlug}/${contentPath}`);
        await file.save(req.body, {
            contentType: 'text/markdown',
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Error saving content:', error);
        res.status(500).json({ error: 'Failed to save content' });
    }
});
// DELETE /admin/content/:countrySlug/:contentPath - Delete content
app.delete('/admin/content/:countrySlug/*', requireAdmin, async (req, res) => {
    try {
        const { countrySlug } = req.params;
        const contentPath = req.params[0];
        const file = storage.bucket(BUCKET_NAME).file(`${countrySlug}/${contentPath}`);
        await file.delete();
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});
// GET /pdf/:countrySlug/:contentPath - Serve PDF file
app.get('/pdf/:countrySlug/*', async (req, res) => {
    try {
        const { countrySlug } = req.params;
        const contentPath = req.params[0];
        const file = storage.bucket(BUCKET_NAME).file(`${countrySlug}/${contentPath}`);
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).json({ error: 'PDF not found' });
        }
        const [metadata] = await file.getMetadata();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="${contentPath}"`,
            ETag: metadata.etag,
            'Cache-Control': 'public, max-age=3600',
        });
        const stream = file.createReadStream();
        stream.pipe(res);
    }
    catch (error) {
        console.error('Error serving PDF:', error);
        res.status(500).json({ error: 'Failed to serve PDF' });
    }
});
// HEAD /pdf/:countrySlug/:contentPath - Check if PDF exists
app.head('/pdf/:countrySlug/*', async (req, res) => {
    try {
        const { countrySlug } = req.params;
        const contentPath = req.params[0];
        const file = storage.bucket(BUCKET_NAME).file(`${countrySlug}/${contentPath}`);
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).send();
        }
        res.status(200).send();
    }
    catch (error) {
        console.error('Error checking PDF:', error);
        res.status(500).send();
    }
});
// Export for Cloud Functions
exports.api = app;

// server.js
import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
config();

// __dirname is not available in ES modules, so we need to define it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Configure Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Retrieve PORT and API key from environment variables
const PORT = process.env.PORT || 3000;
const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle background removal
app.post('/remove-bg', upload.single('image_file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // Create a new FormData instance
        const formData = new FormData();
        formData.append('image_file', fs.createReadStream(path.join(__dirname, req.file.path)));
        formData.append('size', 'auto');

        // Send POST request to remove.bg API
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': REMOVE_BG_API_KEY,
                ...formData.getHeaders(), // Important to include headers from FormData
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors ? errorData.errors[0].title : 'Failed to remove background.');
        }

        const buffer = await response.buffer();

        // Set response headers and send the image back to the client
        res.set('Content-Type', 'image/png');
        res.send(buffer);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        // Clean up the uploaded file
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err.message);
            });
        }
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

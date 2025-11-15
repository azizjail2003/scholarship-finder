const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    
    if (req.method === 'POST' && parsedUrl.pathname === '/webhook/scholarship-finder') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const formData = JSON.parse(body);
                console.log('Received form submission:', formData);
                
                // Mock response simulating successful processing
                const mockResponse = {
                    success: true,
                    message: 'Your profile has been analyzed successfully!',
                    resultUrl: 'https://example.com/results/john-doe-scholarships',
                    data: {
                        name: formData.name,
                        matchedScholarships: 15,
                        matchedUniversities: 8
                    }
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mockResponse));
                
            } catch (error) {
                console.error('Error parsing request:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 5681;
server.listen(PORT, () => {
    console.log(`Mock webhook server running on http://localhost:${PORT}`);
    console.log(`Webhook endpoint: http://localhost:${PORT}/webhook/scholarship-finder`);
});

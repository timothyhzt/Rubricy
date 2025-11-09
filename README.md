# Writer's Assistant - AI Writing Companion

A web-based writing assistant with a Rubricy chatbot interface and Python backend.

## Features

- ✍️ Rich text editor with formatting tools
- 🤖 AI-powered writing assistant (Rubricy)
- 📝 Grammar and spelling checking
- 🎨 Style improvement suggestions
- 💡 Writing idea generation
- 💾 Save and load documents
- 📤 Export documents in multiple formats

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the Flask backend server:
```bash
python app.py
```

The server will start at `http://localhost:5000`

3. Open `webpage.html` in your web browser or serve it through the Flask app.

### API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/chat` - Send messages to Rubricy chatbot
- `POST /api/check-grammar` - Check grammar in text
- `POST /api/improve-style` - Get style improvement suggestions
- `POST /api/generate-ideas` - Generate writing ideas
- `POST /api/save-document` - Save a document
- `GET /api/load-document/<doc_id>` - Load a saved document
- `GET /api/list-documents` - List all saved documents
- `POST /api/export-document` - Export document in various formats

### Project Structure

```
.
├── app.py             # Flask backend server
├── requirements.txt   # Python dependencies
├── webpage.html       # Frontend HTML
├── data/              # Saved documents (created automatically)
└── README.md          # This file
```

### Development

To enhance the backend with actual AI capabilities, consider integrating:
- OpenAI API for advanced language processing
- language-tool-python for grammar checking
- spaCy or NLTK for text analysis
- A database (SQLite, PostgreSQL) for document storage

### Notes

- Documents are saved in the `data/` directory as JSON files
- The backend uses CORS to allow frontend communication
- Debug mode is enabled by default for development


"""
Writer's Assistant - Backend API Server

This Flask application provides REST API endpoints for the Writer's Assistant
frontend application. It handles:
- Chat interactions with Rubricy AI assistant
- Grammar checking
- Style improvement suggestions
- Writing idea generation
- Document save/load operations
- Document export functionality

Author: Writer's Assistant Team
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import json

# Initialize Flask application
app = Flask(__name__)

# Enable CORS (Cross-Origin Resource Sharing) to allow frontend communication
# This allows the frontend to make API requests from different origins
CORS(app)

# ============================================
# Configuration & Setup
# ============================================

# Data directory for storing saved documents
# Creates the directory if it doesn't exist
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# In-memory storage for documents
# Note: In production, replace this with a proper database (SQLite, PostgreSQL, etc.)
documents = {}

# ============================================
# API Routes
# ============================================

@app.route('/')
def index():
    """
    Serve the main HTML file
    Returns: HTML file for the frontend application
    """
    return app.send_static_file('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Handle chat messages from Rubricy AI assistant
    
    Request Body:
        - message (str): User's chat message
        - context (str): Current writing content for context
    
    Returns:
        JSON response with AI-generated chat response
    """
    data = request.json
    message = data.get('message', '')
    context = data.get('context', '')  # Current writing content for context
    
    # Generate response using helper function
    # Note: In production, integrate with OpenAI API, GPT, or other AI services
    response = generate_chat_response(message, context)
    
    return jsonify({
        'success': True,
        'response': response
    })

@app.route('/api/check-grammar', methods=['POST'])
def check_grammar():
    """
    Check grammar and spelling in provided text
    
    Request Body:
        - text (str): Text to check for grammar issues
    
    Returns:
        JSON response with grammar issues and suggestions
    """
    data = request.json
    text = data.get('text', '')
    
    # Check for grammar issues
    # Note: In production, integrate with language-tool-python, Grammarly API, etc.
    issues = check_grammar_issues(text)
    
    return jsonify({
        'success': True,
        'issues': issues,
        'suggestions': generate_grammar_suggestions(issues)
    })

@app.route('/api/improve-style', methods=['POST'])
def improve_style():
    """
    Analyze text and provide style improvement suggestions
    
    Request Body:
        - text (str): Text to analyze for style improvements
    
    Returns:
        JSON response with style suggestions and improved text
    """
    data = request.json
    text = data.get('text', '')
    
    # Generate style improvement suggestions
    suggestions = generate_style_suggestions(text)
    
    return jsonify({
        'success': True,
        'suggestions': suggestions,
        'improved_text': apply_style_improvements(text, suggestions)
    })

@app.route('/api/generate-ideas', methods=['POST'])
def generate_ideas():
    """
    Generate writing ideas based on context and topic
    
    Request Body:
        - context (str): Current writing context
        - topic (str): Optional topic to generate ideas about
    
    Returns:
        JSON response with list of writing ideas
    """
    data = request.json
    context = data.get('context', '')
    topic = data.get('topic', '')
    
    # Generate writing ideas
    ideas = generate_writing_ideas(context, topic)
    
    return jsonify({
        'success': True,
        'ideas': ideas
    })

@app.route('/api/save-document', methods=['POST'])
def save_document():
    """
    Save a document to persistent storage
    
    Request Body:
        - id (str, optional): Document ID (auto-generated if not provided)
        - content (str): Document content/text
        - title (str): Document title
    
    Returns:
        JSON response with saved document data
    """
    data = request.json
    # Generate document ID from timestamp if not provided
    doc_id = data.get('id', datetime.now().strftime('%Y%m%d%H%M%S'))
    content = data.get('content', '')
    title = data.get('title', 'Untitled Document')
    
    # Create document object with metadata
    document = {
        'id': doc_id,
        'title': title,
        'content': content,
        'created_at': datetime.now().isoformat(),  # ISO format timestamp
        'updated_at': datetime.now().isoformat()
    }
    
    # Store in memory (for quick access)
    documents[doc_id] = document
    
    # Save to file system for persistence
    file_path = os.path.join(DATA_DIR, f'{doc_id}.json')
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(document, f, indent=2)  # Pretty print JSON
    
    return jsonify({
        'success': True,
        'document': document
    })

@app.route('/api/load-document/<doc_id>', methods=['GET'])
def load_document(doc_id):
    """
    Load a saved document by its ID
    
    URL Parameters:
        - doc_id (str): Document ID to load
    
    Returns:
        JSON response with document data, or 404 if not found
    """
    file_path = os.path.join(DATA_DIR, f'{doc_id}.json')
    
    # Check if file exists
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            document = json.load(f)
        return jsonify({
            'success': True,
            'document': document
        })
    
    # Return 404 if document not found
    return jsonify({
        'success': False,
        'error': 'Document not found'
    }), 404

@app.route('/api/list-documents', methods=['GET'])
def list_documents():
    """
    List all saved documents with metadata
    
    Returns:
        JSON response with list of documents (sorted by most recent first)
    """
    doc_list = []
    
    # Iterate through all JSON files in data directory
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            file_path = os.path.join(DATA_DIR, filename)
            with open(file_path, 'r', encoding='utf-8') as f:
                doc = json.load(f)
                # Add only metadata (not full content) to list
                doc_list.append({
                    'id': doc.get('id'),
                    'title': doc.get('title'),
                    'created_at': doc.get('created_at'),
                    'updated_at': doc.get('updated_at')
                })
    
    # Sort by updated_at in descending order (most recent first)
    doc_list.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
    
    return jsonify({
        'success': True,
        'documents': doc_list
    })

@app.route('/api/export-document', methods=['POST'])
def export_document():
    """
    Export document content in various formats
    
    Request Body:
        - content (str): Document content to export
        - format (str): Export format ('txt', 'html', 'markdown')
    
    Returns:
        JSON response with exported content in requested format
    """
    data = request.json
    content = data.get('content', '')
    format_type = data.get('format', 'txt')  # Default to plain text
    
    # Handle different export formats
    if format_type == 'txt':
        # Plain text export
        return jsonify({
            'success': True,
            'format': 'txt',
            'content': content
        })
    elif format_type == 'html':
        # HTML export with basic structure
        html_content = f"<html><head><title>Exported Document</title></head><body><pre>{content}</pre></body></html>"
        return jsonify({
            'success': True,
            'format': 'html',
            'content': html_content
        })
    elif format_type == 'markdown':
        # Markdown export (as-is, assuming content is already markdown)
        return jsonify({
            'success': True,
            'format': 'markdown',
            'content': content
        })
    
    # Return error for unsupported formats
    return jsonify({
        'success': False,
        'error': 'Unsupported format'
    }), 400

# ============================================
# Helper Functions: AI/Processing Logic
# ============================================

def generate_chat_response(message, context):
    """
    Generate a response to user's chat message
    
    Args:
        message (str): User's message/question
        context (str): Current writing content for context
    
    Returns:
        str: AI-generated response to the user's message
    
    Note: This is a simple keyword-based implementation.
          In production, integrate with OpenAI API, GPT, or other AI services.
    """
    message_lower = message.lower()
    
    # Keyword-based response logic (replace with actual AI in production)
    if 'grammar' in message_lower or 'spell' in message_lower:
        return "I can help you check grammar and spelling! Try using the 'Check Grammar' button or paste your text here."
    elif 'style' in message_lower or 'improve' in message_lower:
        return "I can help improve your writing style! Use the 'Improve Style' button for suggestions."
    elif 'idea' in message_lower or 'suggest' in message_lower:
        return "I can help generate writing ideas! Use the 'Generate Ideas' button or tell me what you're writing about."
    elif 'hello' in message_lower or 'hi' in message_lower:
        return "Hello! I'm Rubricy, your writing assistant. How can I help you with your writing today?"
    elif 'help' in message_lower:
        return "I can help you with:\n• Grammar and spelling checks\n• Writing style improvements\n• Generating ideas\n• Organizing your thoughts\n\nWhat would you like help with?"
    else:
        return f"I understand you're asking about '{message}'. I'm here to help with your writing! Try asking about grammar, style, or ideas for your piece."

def check_grammar_issues(text):
    """
    Check text for grammar and formatting issues
    
    Args:
        text (str): Text to check for grammar issues
    
    Returns:
        list: List of dictionaries containing issue details (type, message, position)
    
    Note: This is a basic implementation. In production, use:
          - language-tool-python for grammar checking
          - Grammarly API
          - spaCy for NLP analysis
    """
    issues = []
    
    # Basic grammar checks (expand in production)
    if len(text) > 0:
        # Check for double spaces (formatting issue)
        if '  ' in text:
            issues.append({
                'type': 'formatting',
                'message': 'Double spaces detected',
                'position': text.find('  ')
            })
    
    return issues

def generate_grammar_suggestions(issues):
    """
    Generate helpful suggestions based on detected grammar issues
    
    Args:
        issues (list): List of grammar issue dictionaries
    
    Returns:
        list: List of suggestion strings
    """
    suggestions = []
    for issue in issues:
        if issue['type'] == 'formatting':
            suggestions.append("Remove extra spaces for better formatting.")
    return suggestions

def generate_style_suggestions(text):
    """
    Analyze text and generate style improvement suggestions
    
    Args:
        text (str): Text to analyze for style improvements
    
    Returns:
        list: List of style improvement suggestion strings
    """
    suggestions = []
    
    if len(text) > 0:
        # Check for overly long sentences
        sentences = text.split('.')
        long_sentences = [s for s in sentences if len(s) > 100]
        if long_sentences:
            suggestions.append("Consider breaking up long sentences for better readability.")
        
        # Check for overly long paragraphs
        paragraphs = text.split('\n\n')
        if len(paragraphs) > 0 and len(paragraphs[0]) > 500:
            suggestions.append("Consider splitting long paragraphs into shorter ones.")
    
    return suggestions

def apply_style_improvements(text, suggestions):
    """
    Apply style improvements to text based on suggestions
    
    Args:
        text (str): Original text
        suggestions (list): List of style improvement suggestions
    
    Returns:
        str: Improved text (currently returns original - placeholder)
    
    Note: This is a placeholder. In production, implement actual text
          transformation using NLP libraries like spaCy or NLTK.
    """
    # Placeholder implementation - in production, use sophisticated NLP
    return text

def generate_writing_ideas(context, topic):
    """
    Generate writing ideas based on context and topic
    
    Args:
        context (str): Current writing context/content
        topic (str): Optional topic to generate ideas about
    
    Returns:
        list: List of writing idea strings
    """
    ideas = []
    
    # Generate topic-specific ideas if topic provided
    if topic:
        ideas.append(f"Explore different perspectives on '{topic}'")
        ideas.append(f"Write a story about '{topic}' from a unique angle")
        ideas.append(f"Create a detailed description of '{topic}'")
    else:
        # Generate general writing prompts
        ideas.append("Write about a personal experience that changed your perspective")
        ideas.append("Describe a place that holds special meaning to you")
        ideas.append("Create a dialogue between two contrasting characters")
        ideas.append("Write about a moment of realization or discovery")
    
    return ideas

# ============================================
# Application Entry Point
# ============================================

if __name__ == '__main__':
    """
    Run the Flask development server
    
    Starts the server on localhost:5000 with debug mode enabled.
    In production, use a proper WSGI server like Gunicorn or uWSGI.
    """
    print("Starting Writer's Assistant Backend...")
    print("Server running at http://localhost:5000")
    app.run(debug=True, port=5000)


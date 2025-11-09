// Toggle iframe visibility
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleIframe');
    const iframeContainer = document.getElementById('iframeContainer');
    
    if (toggleButton && iframeContainer) {
        // Initially hide the iframe container
        iframeContainer.classList.add('hidden');
        
        // Toggle visibility on button click
        toggleButton.addEventListener('click', function() {
            iframeContainer.classList.toggle('hidden');
        });
    }
});

// Formatting buttons functionality
document.addEventListener('DOMContentLoaded', function() {
    const writingArea = document.getElementById('writingArea');
    const headingBtn = document.getElementById('headingBtn');
    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    
    // Helper function to get plain text from contentEditable
    function getPlainText(element) {
        return element.innerText || element.textContent || '';
    }
    
    // Store the last selection
    let savedSelection = null;
    
    // Save selection when user interacts with editor
    if (writingArea) {
        writingArea.addEventListener('mouseup', saveCurrentSelection);
        writingArea.addEventListener('keyup', saveCurrentSelection);
        writingArea.addEventListener('focus', saveCurrentSelection);
    }
    
    function saveCurrentSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            savedSelection = selection.getRangeAt(0).cloneRange();
        } else {
            savedSelection = null;
        }
    }
    
    // Helper function to apply formatting command
    function applyFormatting(command) {
        // Focus the editor first
        writingArea.focus();
        
        // Restore saved selection
        const selection = window.getSelection();
        if (savedSelection) {
            selection.removeAllRanges();
            selection.addRange(savedSelection);
        } else {
            // If no saved selection, try to maintain cursor position
            // Create a collapsed range at the end
            const range = document.createRange();
            range.selectNodeContents(writingArea);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        // Execute the command
        const success = document.execCommand(command, false, null);
        
        // Save the new selection
        saveCurrentSelection();
        
        if (!success) {
            console.warn('Formatting command failed:', command);
        }
    }
    
    // Bold button - Apply bold formatting
    if (boldBtn && writingArea) {
        boldBtn.addEventListener('mousedown', function(e) {
            // Save selection before focus is lost
            saveCurrentSelection();
            e.preventDefault();
        });
        boldBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            applyFormatting('bold');
            saveContent();
            updateWordCount();
        });
    }
    
    // Italic button - Apply italic formatting
    if (italicBtn && writingArea) {
        italicBtn.addEventListener('mousedown', function(e) {
            // Save selection before focus is lost
            saveCurrentSelection();
            e.preventDefault();
        });
        italicBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            applyFormatting('italic');
            saveContent();
            updateWordCount();
        });
    }
    
    // Helper function to check if selection is in an underline tag
    function isInUnderline(range) {
        let container = range.commonAncestorContainer;
        if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentElement;
        }
        
        let current = container;
        while (current && current !== writingArea) {
            if (current.tagName && current.tagName.toUpperCase() === 'U') {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }
    
    // Helper function to manually apply underline
    function applyUnderlineManually(range) {
        const selection = window.getSelection();
        
        // Ensure selection is set
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Get the current range from selection (in case it was modified)
        if (selection.rangeCount === 0) return;
        const currentRange = selection.getRangeAt(0);
        
        // Extract contents and wrap in <u> tag
        const contents = currentRange.extractContents();
        const u = document.createElement('u');
        
        // Move all contents into the <u> tag (preserves HTML structure)
        while (contents.firstChild) {
            u.appendChild(contents.firstChild);
        }
        
        // If u is empty, add a zero-width space
        if (!u.firstChild) {
            u.appendChild(document.createTextNode('\u200B'));
        }
        
        // Insert the <u> tag at the range position
        currentRange.insertNode(u);
        
        // Set cursor after the underlined content
        const newRange = document.createRange();
        newRange.setStartAfter(u);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
    
    // Underline button - Apply underline formatting
    if (underlineBtn && writingArea) {
        underlineBtn.addEventListener('mousedown', function(e) {
            // Save selection before focus is lost
            saveCurrentSelection();
            e.preventDefault();
        });
        underlineBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            writingArea.focus();
            
            // Restore saved selection or get current selection
            const selection = window.getSelection();
            let range;
            
            if (savedSelection) {
                selection.removeAllRanges();
                selection.addRange(savedSelection);
                range = savedSelection.cloneRange();
            } else if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0).cloneRange();
            } else {
                // No selection, nothing to underline
                return;
            }
            
            // Check if we're already in an underline tag
            const underlineElement = isInUnderline(range);
            
            if (underlineElement) {
                // Remove underline: unwrap the <u> tag
                const parent = underlineElement.parentNode;
                while (underlineElement.firstChild) {
                    parent.insertBefore(underlineElement.firstChild, underlineElement);
                }
                parent.removeChild(underlineElement);
                
                // Normalize the parent to merge adjacent text nodes
                parent.normalize();
                
                // Set cursor after the unwrapped content
                const newRange = document.createRange();
                if (parent.lastChild && parent.lastChild.nodeType === Node.TEXT_NODE) {
                    newRange.setStart(parent.lastChild, parent.lastChild.textContent.length);
                } else {
                    newRange.setStartAfter(parent.lastChild || parent);
                }
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                // Apply underline: use manual wrapping (more reliable than execCommand)
                applyUnderlineManually(range);
            }
            
            saveCurrentSelection();
            writingArea.focus();
            saveContent();
            updateWordCount();
        });
    }
    
    // Heading button - Format as heading
    if (headingBtn && writingArea) {
        headingBtn.addEventListener('mousedown', function(e) {
            // Save selection before focus is lost
            saveCurrentSelection();
            e.preventDefault();
        });
        headingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            writingArea.focus();
            
            // Restore saved selection or get current selection
            const selection = window.getSelection();
            let range;
            
            if (savedSelection) {
                selection.removeAllRanges();
                selection.addRange(savedSelection);
                range = savedSelection;
            } else if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            } else {
                // Create range at end if no selection
                range = document.createRange();
                range.selectNodeContents(writingArea);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            
            const selectedText = range.toString();
            
            if (selectedText) {
                // Wrap selected text in h2 tag
                const h2 = document.createElement('h2');
                h2.textContent = selectedText;
                range.deleteContents();
                range.insertNode(h2);
                // Set cursor after the heading
                const newRange = document.createRange();
                newRange.setStartAfter(h2);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } else {
                // Check if cursor is in an existing heading
                let container = range.commonAncestorContainer;
                if (container.nodeType === Node.TEXT_NODE) {
                    container = container.parentElement;
                }
                
                // If already in a heading, convert to regular text
                if (container && container.tagName === 'H2') {
                    const textNode = document.createTextNode(container.textContent);
                    container.parentNode.replaceChild(textNode, container);
                    range.setStart(textNode, textNode.length);
                    range.collapse(true);
                } else {
                    // Insert heading at cursor
                    const h2 = document.createElement('h2');
                    h2.textContent = 'Heading';
                    range.insertNode(h2);
                    // Move cursor after heading
                    range.setStartAfter(h2);
                    range.collapse(true);
                }
                selection.removeAllRanges();
                selection.addRange(range);
            }
            
            saveCurrentSelection();
            writingArea.focus();
            saveContent();
            updateWordCount();
        });
    }
    
    // Save content function
    function saveContent() {
        if (writingArea) {
            localStorage.setItem('writerContent', writingArea.innerHTML);
        }
    }
    
    // Word count update function
    function updateWordCount() {
        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');
        
        if (writingArea && wordCountEl && charCountEl) {
            const text = getPlainText(writingArea);
            const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const chars = text.length;
            
            wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
            charCountEl.textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
        }
    }
    
    // Auto-save on input
    if (writingArea) {
        writingArea.addEventListener('input', function() {
            saveContent();
            updateWordCount();
        });
    }
});

// Action buttons functionality
document.addEventListener('DOMContentLoaded', function() {
    const writingArea = document.getElementById('writingArea');
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const newBtn = document.getElementById('newBtn');
    const openBtn = document.getElementById('openBtn');
    
    // Helper function to get plain text
    function getPlainText(element) {
        return element.innerText || element.textContent || '';
    }
    
    // Load saved content from localStorage on page load
    if (writingArea) {
        const savedContent = localStorage.getItem('writerContent');
        if (savedContent) {
            writingArea.innerHTML = savedContent;
            updateWordCount();
        }
    }
    
    // Save button - Save to localStorage
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            if (writingArea) {
                localStorage.setItem('writerContent', writingArea.innerHTML);
                showNotification('Document saved successfully!', 'success');
            }
        });
    }
    
    // Export button - Export as file (plain text)
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            if (writingArea) {
                const plainText = getPlainText(writingArea);
                exportDocument(plainText);
            }
        });
    }
    
    // New button - Create new document
    if (newBtn) {
        newBtn.addEventListener('click', function() {
            if (writingArea) {
                const text = getPlainText(writingArea);
                if (text.trim() !== '') {
                    if (confirm('Are you sure you want to create a new document? Your current content will be cleared.')) {
                        writingArea.innerHTML = '';
                        localStorage.removeItem('writerContent');
                        updateWordCount();
                        showNotification('New document created!', 'success');
                    }
                } else {
                    writingArea.innerHTML = '';
                    updateWordCount();
                }
            }
        });
    }
    
    // Open button - Open file from computer
    if (openBtn) {
        openBtn.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.txt,.md,.doc,.docx';
            fileInput.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (writingArea) {
                            // Set as plain text (preserve formatting would require HTML parsing)
                            const text = event.target.result;
                            writingArea.innerHTML = text.split('\n').map(line => {
                                if (line.trim()) {
                                    return `<p>${line}</p>`;
                                }
                                return '<br>';
                            }).join('');
                            localStorage.setItem('writerContent', writingArea.innerHTML);
                            updateWordCount();
                            showNotification('File opened successfully!', 'success');
                        }
                    };
                    reader.readAsText(file);
                }
            };
            fileInput.click();
        });
    }
    
    // Word count update function
    function updateWordCount() {
        const wordCountEl = document.getElementById('wordCount');
        const charCountEl = document.getElementById('charCount');
        
        if (writingArea && wordCountEl && charCountEl) {
            const text = getPlainText(writingArea);
            const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const chars = text.length;
            
            wordCountEl.textContent = `${words} word${words !== 1 ? 's' : ''}`;
            charCountEl.textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
        }
    }
    
    // Export document function
    function exportDocument(content) {
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `writer-document-${timestamp}.txt`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Document exported successfully!', 'success');
    }
    
    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
});


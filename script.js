const form = document.getElementById('storyForm');
const promptInput = document.getElementById('promptInput');
const responseSection = document.getElementById('responseSection');
const errorMessage = document.getElementById('errorMessage');
const spinner = document.getElementById('spinner');
const submitButton = form.querySelector('button[type="submit"]');
const storySection = document.getElementById('storySection');
const storyContent = document.getElementById('storyContent');

let currentStory = '';
let optionsContainer = null;

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const prompt = promptInput.value.trim();

    if (!prompt) {
        showError('Please enter a story prompt.');
        return;
    }

    // Initialize story with the prompt
    currentStory = prompt;
    
    showLoading(true);
    hideError();

    try {
        await fetchNextOptions();
        displayStory();
        promptInput.value = '';
    } catch (error) {
        showError(`Error: ${error.message}`);
    } finally {
        showLoading(false);
    }
});

async function fetchNextOptions() {
    const res = await fetch('/api/continue-story', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ story: currentStory })
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `API request failed: ${res.statusText}`);
    }

    const data = await res.json();
    displayOptions(data.options);
}

function displayOptions(options) {
    // Remove previous options container if it exists
    if (optionsContainer) {
        optionsContainer.remove();
    }
    
    // Create options container
    optionsContainer = document.createElement('div');
    optionsContainer.style.marginTop = '20px';
    optionsContainer.style.paddingTop = '15px';
    optionsContainer.style.borderTop = '1px solid #444444';
    
    const title = document.createElement('h5');
    title.textContent = 'Choose the next sentence:';
    title.style.marginBottom = '15px';
    title.style.color = '#ffffff';
    optionsContainer.appendChild(title);
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '10px';
    
    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-outline-light w-100 text-start';
        btn.style.padding = '12px 16px';
        btn.style.justifyContent = 'flex-start';
        btn.style.whiteSpace = 'normal';
        btn.style.textAlign = 'left';
        btn.textContent = option;
        btn.onclick = () => selectSentence(option);
        buttonsContainer.appendChild(btn);
    });
    
    optionsContainer.appendChild(buttonsContainer);
    storySection.appendChild(optionsContainer);
}

function selectSentence(sentence) {
    currentStory += ' ' + sentence;
    displayStory();
    
    // Fetch new options
    showLoading(true);
    fetchNextOptions()
        .catch(error => showError(`Error: ${error.message}`))
        .finally(() => showLoading(false));
}

function displayStory() {
    storyContent.textContent = currentStory;
    storySection.classList.add('show');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    responseSection.classList.add('show');
}

function hideError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

function showLoading(isLoading) {
    submitButton.disabled = isLoading;
    if (isLoading) {
        spinner.classList.add('show');
    } else {
        spinner.classList.remove('show');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setSampleText(text) {
    const input = document.getElementById("textToAnalyze");
    input.value = text;
    input.focus();
}

function getEmotionColor(emotion) {
    switch (emotion.toLowerCase()) {
        case 'joy':
            return {
                bg: 'rgba(16, 185, 129, 0.18)',
                border: '#10b981',
                text: '#34d399',
                fill: 'linear-gradient(90deg, #059669, #10b981)',
                icon: '🌟'
            };
        case 'anger':
            return {
                bg: 'rgba(239, 68, 68, 0.18)',
                border: '#ef4444',
                text: '#f87171',
                fill: 'linear-gradient(90deg, #dc2626, #ef4444)',
                icon: '😡'
            };
        case 'disgust':
            return {
                bg: 'rgba(168, 85, 247, 0.18)',
                border: '#a855f7',
                text: '#c084fc',
                fill: 'linear-gradient(90deg, #7c3aed, #a855f7)',
                icon: '🤢'
            };
        case 'fear':
            return {
                bg: 'rgba(245, 158, 11, 0.18)',
                border: '#f59e0b',
                text: '#fbbf24',
                fill: 'linear-gradient(90deg, #d97706, #f59e0b)',
                icon: '😨'
            };
        case 'sadness':
            return {
                bg: 'rgba(59, 130, 246, 0.18)',
                border: '#3b82f6',
                text: '#60a5fa',
                fill: 'linear-gradient(90deg, #2563eb, #3b82f6)',
                icon: '😢'
            };
        default:
            return {
                bg: 'rgba(99, 102, 241, 0.18)',
                border: '#6366f1',
                text: '#818cf8',
                fill: 'linear-gradient(90deg, #4f46e5, #6366f1)',
                icon: '✨'
            };
    }
}

function renderVisualResponse(rawResponse, container) {
    if (rawResponse.includes("Invalid text! Please try again!")) {
        container.innerHTML = `
            <div class="alert-error-card">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>Invalid text! Please try again!</span>
            </div>
        `;
        return;
    }

    const angerMatch = rawResponse.match(/'anger':\s*([0-9.]+)/);
    const disgustMatch = rawResponse.match(/'disgust':\s*([0-9.]+)/);
    const fearMatch = rawResponse.match(/'fear':\s*([0-9.]+)/);
    const joyMatch = rawResponse.match(/'joy':\s*([0-9.]+)/);
    const sadnessMatch = rawResponse.match(/'sadness':\s*([0-9.]+)/);
    const dominantMatch = rawResponse.match(/The dominant emotion is\s*(?:<[^>]+>)?\s*([a-zA-Z]+)/i);

    if (angerMatch && dominantMatch) {
        const anger = parseFloat(angerMatch[1]);
        const disgust = parseFloat(disgustMatch[1]);
        const fear = parseFloat(fearMatch[1]);
        const joy = parseFloat(joyMatch[1]);
        const sadness = parseFloat(sadnessMatch[1]);
        const dominant = dominantMatch[1];
        const dominantStyle = getEmotionColor(dominant);

        const emotions = [
            { name: 'Joy', score: joy, color: getEmotionColor('joy').fill },
            { name: 'Anger', score: anger, color: getEmotionColor('anger').fill },
            { name: 'Sadness', score: sadness, color: getEmotionColor('sadness').fill },
            { name: 'Fear', score: fear, color: getEmotionColor('fear').fill },
            { name: 'Disgust', score: disgust, color: getEmotionColor('disgust').fill }
        ];

        let barsHtml = emotions.map(e => {
            const pct = Math.min(100, Math.max(2, Math.round(e.score * 100)));
            return `
                <div class="emotion-row">
                    <span class="emotion-name">${e.name}</span>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${pct}%; background: ${e.color};"></div>
                    </div>
                    <span class="emotion-score">${(e.score * 100).toFixed(1)}%</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="result-card">
                <div class="dominant-badge-container">
                    <span class="dominant-label">Dominant Emotion Detected:</span>
                    <span class="dominant-value" style="background: ${dominantStyle.bg}; border: 1px solid ${dominantStyle.border}; color: ${dominantStyle.text};">
                        ${dominantStyle.icon} ${dominant}
                    </span>
                </div>

                <div class="emotion-bars">
                    ${barsHtml}
                </div>

                <p class="raw-system-output">${rawResponse}</p>
            </div>
        `;
    } else {
        container.innerHTML = `<p class="raw-system-output">${rawResponse}</p>`;
    }
}

let RunSentimentAnalysis = () => {
    const textInput = document.getElementById("textToAnalyze");
    const textToAnalyze = textInput.value;
    const responseContainer = document.getElementById("system_response");
    const submitBtn = document.getElementById("submitBtn");

    // 1. Mostrar estado de carga (loader)
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
            Analyzing emotions...
        `;
    }

    responseContainer.innerHTML = `
        <div class="analysis-loader">
            <div class="loader-spinner"></div>
            <div class="loader-text">
                <strong>Analyzing emotional tone with AI...</strong>
                <span>Processing natural language through Watson NLP model</span>
            </div>
        </div>
    `;

    // 2. Realizar petición asíncrona
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            // Restaurar botón
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Run Sentiment Analysis
                `;
            }

            if (this.status == 200) {
                renderVisualResponse(xhttp.responseText, responseContainer);
            } else {
                responseContainer.innerHTML = `
                    <div class="alert-error-card">
                        <span>Connection error. Please ensure the backend server is running.</span>
                    </div>
                `;
            }
        }
    };

    xhttp.open("GET", "emotionDetector?textToAnalyze=" + encodeURIComponent(textToAnalyze), true);
    xhttp.send();
};

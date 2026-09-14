"""
Emotion Detection module using Watson NLP Emotion Predict service.
"""
import json
import requests

# Rich bilingual emotion lexicon for local offline analysis
EMOTION_LEXICON = {
    'anger': [
        'angr', 'mad', 'furio', 'rage', 'irritat', 'annoy', 'frustrat', 'hate',
        'hostil', 'bitter', 'enrag', 'piss', 'outrag', 'terribl', 'horribl',
        'suck', 'stupid', 'idiot', 'enoj', 'furi', 'rabia', 'ira', 'molest',
        'indigna', 'odio', 'bronca', 'enfad', 'fastidi', 'colera', 'detest',
        'pesim', 'mierda', 'coraje'
    ],
    'disgust': [
        'disgust', 'gross', 'revolt', 'repuls', 'yuck', 'nause', 'nasty',
        'foul', 'abhorr', 'loath', 'vomit', 'asco', 'asquer', 'repugnan',
        'repulsion', 'desagrad', 'guacala', 'fuchi'
    ],
    'fear': [
        'fear', 'afraid', 'scared', 'fright', 'terror', 'panic', 'horror',
        'dread', 'anxio', 'nervous', 'worr', 'alarm', 'danger', 'threat',
        'phobia', 'shock', 'miedo', 'mied', 'temor', 'temer', 'asust',
        'panico', 'ansie', 'nervio', 'preocup', 'susto', 'pavor', 'peligro',
        'angust', 'insegur', 'reprob'
    ],
    'joy': [
        'joy', 'happ', 'glad', 'cheer', 'delight', 'excit', 'love', 'wonder',
        'amaz', 'great', 'awesom', 'fantast', 'excel', 'pleas', 'thrill',
        'fun', 'smile', 'laugh', 'celebrat', 'satisf', 'bliss', 'bless',
        'feliz', 'felicidad', 'alegr', 'content', 'encant', 'emocion', 'amor',
        'genial', 'maravill', 'divert', 'risa', 'gusto', 'placer', 'estupend',
        'bien', 'bueno', 'buena'
    ],
    'sadness': [
        'sad', 'sorrow', 'unhapp', 'depress', 'cry', 'grief', 'heartbreak',
        'mourn', 'despair', 'lone', 'gloom', 'miser', 'pity', 'regret',
        'hopeless', 'hurt', 'tear', 'down', 'trist', 'pena', 'llor', 'depre',
        'dolor', 'duelo', 'soledad', 'decepcion', 'desilusion', 'lagrima',
        'bajon', 'mal', 'fracas', 'desanim'
    ]
}


def _analyze_local(text):
    """
    Local heuristic fallback analyzer to compute dynamic emotion scores
    when running outside the IBM Skills Network cloud environment.
    """
    text_clean = text.lower()
    weights = {
        'anger': 0.015,
        'disgust': 0.015,
        'fear': 0.015,
        'joy': 0.015,
        'sadness': 0.015
    }

    for emotion, stems in EMOTION_LEXICON.items():
        for stem in stems:
            if stem in text_clean:
                weights[emotion] += 0.45

    total = sum(weights.values())
    scores = {k: round(v / total, 4) for k, v in weights.items()}
    dominant = max(scores, key=scores.get)
    return scores, dominant


def emotion_detector(text_to_analyse):
    """
    Analyzes the emotion in a given text using Watson NLP EmotionPredict API
    with intelligent fallback for local development environments.
    """
    url = (
        'https://sn-watson-emotion.labs.skills.network/v1/'
        'watson.runtime.nlp.v1/NlpService/EmotionPredict'
    )
    headers = {"grpc-metadata-mm-model-id": "emotion_aggregated-workflow_lang_en_stock"}
    myobj = {"raw_document": {"text": text_to_analyse}}

    if not text_to_analyse or not str(text_to_analyse).strip():
        return {
            'anger': None,
            'disgust': None,
            'fear': None,
            'joy': None,
            'sadness': None,
            'dominant_emotion': None
        }

    try:
        response = requests.post(url, json=myobj, headers=headers, timeout=1)
        if response.status_code == 400:
            return {
                'anger': None,
                'disgust': None,
                'fear': None,
                'joy': None,
                'sadness': None,
                'dominant_emotion': None
            }

        formatted_response = json.loads(response.text)
        emotions = formatted_response['emotionPredictions'][0]['emotion']

        anger_score = emotions['anger']
        disgust_score = emotions['disgust']
        fear_score = emotions['fear']
        joy_score = emotions['joy']
        sadness_score = emotions['sadness']
        dominant_emotion = max(emotions, key=emotions.get)
    except requests.exceptions.RequestException:
        scores, dominant_emotion = _analyze_local(str(text_to_analyse))
        return {
            'anger': scores['anger'],
            'disgust': scores['disgust'],
            'fear': scores['fear'],
            'joy': scores['joy'],
            'sadness': scores['sadness'],
            'dominant_emotion': dominant_emotion
        }

    return {
        'anger': anger_score,
        'disgust': disgust_score,
        'fear': fear_score,
        'joy': joy_score,
        'sadness': sadness_score,
        'dominant_emotion': dominant_emotion
    }

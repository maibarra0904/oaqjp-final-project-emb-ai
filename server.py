"""
Flask server for Emotion Detection application.
"""
import socket
from flask import Flask, render_template, request
from EmotionDetection.emotion_detection import emotion_detector

app = Flask("Emotion Detector")


def check_port_in_use(port_num):
    """
    Checks whether a specific local network port is in use.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        return sock.connect_ex(("localhost", port_num)) == 0


@app.route("/emotionDetector")
def sent_detector():
    """
    Analyzes text emotions and returns formatted response or error message.
    """
    text_to_analyse = request.args.get("textToAnalyze")
    response = emotion_detector(text_to_analyse)

    if response["dominant_emotion"] is None:
        return "Invalid text! Please try again!"

    anger = response["anger"]
    disgust = response["disgust"]
    fear = response["fear"]
    joy = response["joy"]
    sadness = response["sadness"]
    dominant_emotion = response["dominant_emotion"]

    return (
        f"For the given statement, the system response is 'anger': {anger}, "
        f"'disgust': {disgust}, 'fear': {fear}, 'joy': {joy} and "
        f"'sadness': {sadness}. The dominant emotion is {dominant_emotion}."
    )


@app.route("/")
def render_index_page():
    """
    Renders the index page.
    """
    return render_template("index.html")


if __name__ == "__main__":
    target_port = 5000
    if check_port_in_use(5000):
        print("\n[AVISO] El puerto 5000 está en uso por AirPlay de macOS.")
        print("[INFO] Levantando servidor en http://localhost:5001\n")
        target_port = 5001

    app.run(host="0.0.0.0", port=target_port)

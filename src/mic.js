// Importing necessary modules and components
import React, { useState } from 'react'; // Importing React and useState hook
import './App.css'; // Importing custom CSS for styling
import languageList from './language.json'; // Importing a JSON file containing language information
import axios from 'axios'; // Importing axios for making HTTP requests
import { AudioMutedOutlined, AudioOutlined, SwapOutlined } from '@ant-design/icons'; // Importing icons from ant-design

// Defining the Translator component
export default function Translator() {
    // Declaring state variables using useState hook
    const [inputFormat, setInputFormat] = useState('en'); // Language of input text, default is English ('en')
    const [outputFormat, setOutputFormat] = useState(''); // Language of output text, default is empty
    const [translatedText, setTranslatedText] = useState('Translation'); // Text after translation, default is 'Translation'
    const [inputText, setInputText] = useState(''); // Input text to be translated, default is empty
    const [recognizing, setRecognizing] = useState(false); // Flag to track if speech recognition is active, default is false

    // Initializing the speech recognition object
    let recognition;
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Web Speech API is not supported in this browser.'); // Logging if the browser doesn't support speech recognition
    } else {
        recognition = new window.webkitSpeechRecognition(); // Creating a new instance of speech recognition
        recognition.continuous = false; // Setting recognition to be non-continuous
        recognition.interimResults = false; // No interim results, only final result
        recognition.lang = inputFormat; // Setting the language for recognition

        // Event handler for when recognition starts
        recognition.onstart = () => {
            setRecognizing(true); // Setting recognizing state to true
        };

        // Event handler for when recognition results are available
        recognition.onresult = (event) => {
            setRecognizing(false); // Setting recognizing state to false
            const speechToText = event.results[0][0].transcript; // Extracting the transcribed text from event
            setInputText(speechToText); // Setting the inputText state to the transcribed text
        };

        // Event handler for recognition errors
        recognition.onerror = (event) => {
            setRecognizing(false); // Setting recognizing state to false
            console.error('Speech recognition error', event.error); // Logging the error
        };

        // Event handler for when recognition ends
        recognition.onend = () => {
            setRecognizing(false); // Setting recognizing state to false
        };
    }

    // Function to start speech recognition
    const startRecognition = () => {
        if (recognition) {
            recognition.lang = inputFormat; // Setting the language for recognition
            recognition.start(); // Starting speech recognition
        }
    };

    // Function to reverse input and output languages
    const handleReverseLanguage = () => {
        const value = inputFormat; // Temporarily storing the input language
        setInputFormat(outputFormat); // Setting input language to output language
        setOutputFormat(value); // Setting output language to stored input language
        setInputText(''); // Clearing the input text
        setTranslatedText('Translation'); // Resetting the translated text
    };

    // Function to clear input text and reset translated text
    const handleRemoveInputText = () => {
        setInputText(''); // Clearing the input text
        setTranslatedText('Translation'); // Resetting the translated text
    };

    // Function to handle the translation process
    const handleTranslate = async () => {
        if (!inputText || !inputFormat || !outputFormat) return; // Return if any required field is missing

        setTranslatedText('Translating...'); // Setting a temporary translating message

        // Options for the API request
        const options = {
            method: 'POST',
            url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
            params: {
                'api-version': '3.0',
                to: outputFormat,
                from: inputFormat
            },
            headers: {
                'x-rapidapi-key': '12bee6d5f7msh0678d481138dcf0p114d09jsne8bd4a5a74e3',
                'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: [{
                Text: inputText
            }]
        };

        try {
            const response = await axios.request(options); // Making the API request
            const translation = response.data[0].translations[0].text; // Extracting the translation from the response
            console.log("translation", translation); // Logging the translation
            setTranslatedText(translation); // Setting the translated text
        } catch (error) {
            console.error(error); // Logging any error
            setTranslatedText('Error in translation'); // Setting an error message
        }
    };

    // Rendering the component
    return (
        <div className="container">
            <div className="row1">
                <select value={inputFormat} onChange={(e) => setInputFormat(e.target.value)}>
                    {Object.keys(languageList).map((key, index) => {
                        const language = languageList[key];
                        return (
                            <option key={index} value={key}>{language.name}</option>
                        );
                    })}
                </select>
                <SwapOutlined onClick={handleReverseLanguage} />

                <select value={outputFormat} onChange={(e) => {
                    setOutputFormat(e.target.value);
                    setTranslatedText('Translation');
                }}>
                    {Object.keys(languageList).map((key, index) => {
                        const language = languageList[key];
                        return (
                            <option key={index + 118} value={key}>{language.name}</option>
                        );
                    })}
                </select>
            </div>
            <div className="row2">
                <div className="inputText">
                    <svg className='removeinput'
                        style={{ display: (inputText.length) ? "block" : "none" }}
                        onClick={handleRemoveInputText}
                        focusable="false"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
                        </path>
                    </svg>
                    <textarea type="text"
                        value={inputText}
                        placeholder='Enter Text'
                        onChange={(e) => setInputText(e.target.value)} />
                </div>
                <button onClick={startRecognition} disabled={recognizing} className="audioButton">
                    {recognizing ? <AudioOutlined /> : <AudioMutedOutlined />}
                </button>
                <div className="outputText">{translatedText}</div>
                <button>
                    
                </button>
            </div>
            <div className="row3">
                <button className='btn'
                    onClick={handleTranslate}>
                    <i className="fa fa-spinner fa-spin"></i>
                    <span className='translate'>Translate</span>
                </button>
            </div>
        </div>
    );
}

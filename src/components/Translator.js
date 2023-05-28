import { useRef, useState } from "react";
import TextToSpeech from "./TextToSpeech";

export default function Translator()
{
    const refTextParam = useRef(null);
    const [translatedText, setTranslatedText] = useState(null);
    const [value, setValue] = useState("ro");

    function handleChange(event) {
        setValue(event.target.value);
    }

    function getTextTranslated() {
        fetch(`https://cclab4.azurewebsites.net/textTranslator?text=${refTextParam.current.value}&to=${value}`)
        .then(resp => {
            if(resp.ok)
                return resp.json();
            return resp.json().then(response => { throw new Error(response.message) });
        })
        .then(resp => setTranslatedText(resp.translations[0].text))
        .catch(err => console.log(err));
    }

    return (
        <>
            <div className="container">
                <h2>Translate text to a language of your choice</h2>
                <div>
                    <input
                        ref={refTextParam}
                        type="text"
                        placeholder="Enter text to be translated"
                    />
                    <select className="languages-button" name="language" id="language" onChange={handleChange}>
                        <option value="ro" selected> Romanian</option>
                        <option value="es">Spanish</option>
                        <option value="zh-Hant">Chinese</option>
                        <option value="ru">Russian</option>
                    </select>
                    <button className="main-button" onClick={getTextTranslated}>Translate</button>
                </div>
            </div>

            {
                translatedText &&
                <div className="translated-text">
                    <p>{translatedText}</p>
                    <TextToSpeech language={value} text={translatedText}/>
                </div>
            }
        </>
    );
}
export default function TextToSpeech(props)
{
    function getTextToSpeech()
    {
        fetch(`https://cclab4.azurewebsites.net/textToSpeech?language=${props.language}&phrase=${props.text}`)
        .then(res => res.text())
        .then(data => transformTextToSpeech(data))
        .catch(err => console.log(err));
    }

    function transformTextToSpeech(base_string_phrase)
    {
        var snd = new Audio(`data:audio/mpeg;base64,${base_string_phrase}`);

        var playPromise = snd.play();

        if (playPromise !== undefined) {
            playPromise
            .then(() => console.log("Speech Played!"))
            .catch((err) => console.log(err));
        }
    }

    function copyToClipboard()
    {
        navigator.clipboard.writeText(props.text);
    }

    return (
        <>
            <button className="round-button" title="Speak" onClick={getTextToSpeech}>
                <i className="fa-solid fa-volume-high"></i>
            </button>
            <button className="round-button" title="Copy" onClick={copyToClipboard}>
                <i className="fa-solid fa-copy"></i>
            </button>
        </>
    );
}
const startButton = document.getElementById("start-button");
const endButton = document.getElementById("end-button");

const aiStatus = document.getElementById("ai-status");
const examinerMessage = document.getElementById("examiner-message");

const conversationMessages =
    document.getElementById("conversation-messages");

const testTimer =
    document.getElementById("test-timer");


let seconds = 0;
let timerInterval;

let conversation = [];

let recognition;

let isTestRunning = false;


startButton.addEventListener("click", startSpeakingTest);

endButton.addEventListener("click", endSpeakingTest);



const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (!SpeechRecognition) {

    alert(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
    );

} else {

    recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;


    recognition.onresult = function (event) {

        const userText =
            event.results[0][0].transcript;

        addUserMessage(userText);

        sendToAI(userText);

    };


    recognition.onerror = function (event) {

        console.error("Microphone error:", event.error);

        aiStatus.textContent =
            "Microphone error. Try again.";

    };

}




async function startSpeakingTest() {

    isTestRunning = true;

    startButton.disabled = true;
    endButton.disabled = false;

    seconds = 0;
    conversation = [];

    conversationMessages.innerHTML = "";

    aiStatus.textContent =
        "AI is connecting...";


    examinerMessage.textContent =
        "Connecting to your AI IELTS examiner...";


    startTimer();



    conversation.push({

        role: "user",

        parts: [
            {
                text:
                "Start a realistic IELTS Speaking Part 1 test. Greet the candidate and ask for their full name."
            }
        ]

    });



    await sendConversationToAI();

}





async function sendToAI(userText) {


    if (!isTestRunning) return;


    conversation.push({

        role: "user",

        parts: [
            {
                text: userText
            }
        ]

    });


    await sendConversationToAI();

}





async function sendConversationToAI() {


    try {


        aiStatus.textContent =
            "AI is thinking...";



        const response = await fetch(

            "https://factewow-1.onrender.com/speaking-response",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                    "application/json"

                },


                body: JSON.stringify({

                    conversation: conversation

                })

            }

        );



        const data = await response.json();



        if (!data.reply) {

            throw new Error(
                "No AI reply received"
            );

        }



        conversation.push({

            role: "model",

            parts: [

                {
                    text: data.reply
                }

            ]

        });



        examinerMessage.textContent =
            data.reply;


        aiStatus.textContent =
            "AI examiner is speaking...";


        addAIMessage(data.reply);


        speakAI(data.reply);



    } catch (error) {


        console.error(error);


        aiStatus.textContent =
            "Connection failed";


        examinerMessage.textContent =
            "The AI could not connect.";

    }

}





function speakAI(text) {


    const speech =
        new SpeechSynthesisUtterance(text);


    speech.lang = "en-US";

    speech.rate = 0.95;

    speech.pitch = 1;



    speech.onend = function () {


        if (isTestRunning && recognition) {


            aiStatus.textContent =
                "Your turn — speak now.";


            recognition.start();

        }

    };



    window.speechSynthesis.cancel();

    window.speechSynthesis.speak(speech);

}





function addAIMessage(text) {


    conversationMessages.innerHTML += `

        <div class="message ai-message">

            <strong>AI Examiner</strong>

            <p>${text}</p>

        </div>

    `;

}





function addUserMessage(text) {


    conversationMessages.innerHTML += `

        <div class="message user-message">

            <strong>You</strong>

            <p>${text}</p>

        </div>

    `;

}





function endSpeakingTest() {


    isTestRunning = false;


    clearInterval(timerInterval);


    if (recognition) {

        recognition.stop();

    }


    window.speechSynthesis.cancel();



    startButton.disabled = false;

    endButton.disabled = true;



    aiStatus.textContent =
        "Test ended";


    examinerMessage.textContent =
        "Your speaking session has ended.";

}





function startTimer() {


    timerInterval = setInterval(function () {


        seconds++;


        const minutes =
            Math.floor(seconds / 60);


        const remainingSeconds =
            seconds % 60;



        testTimer.textContent =

            String(minutes).padStart(2, "0")

            +

            ":"

            +

            String(remainingSeconds).padStart(2, "0");



    }, 1000);

}

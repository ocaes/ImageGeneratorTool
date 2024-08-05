document.addEventListener("DOMContentLoaded", () => {
    const generateForm = document.querySelector(".generate-form");
    const generateBtn = generateForm.querySelector(".generate-btn");
    const imageGallery = document.querySelector(".image-gallery");
    const HUGGING_FACE_API_KEY = "HUGGING_FACE_API_KEY"; // Your Hugging Face API key here
    let isImageGenerating = false;

    const updateImageCard = (imgDataArray) => {
        imgDataArray.forEach((imgObject) => {
            const imgCard = document.createElement("div");
            imgCard.classList.add("img-card", "loading");

            const imgElement = document.createElement("img");
            imgCard.appendChild(imgElement);

            const downloadBtn = document.createElement("a");
            downloadBtn.classList.add("download-btn");
            downloadBtn.innerHTML = '<img src="images/download.svg" alt="download">';
            imgCard.appendChild(downloadBtn);

            // Set the image source to the AI-generated image data
            const aiGeneratedImage = `data:image/png;base64,${imgObject.image}`;
            imgElement.src = aiGeneratedImage;

            // When the image is loaded, remove the loading class and set download attributes
            imgElement.onload = () => {
                imgCard.classList.remove("loading");
                downloadBtn.setAttribute("href", aiGeneratedImage);
                downloadBtn.setAttribute("download", `${new Date().getTime()}.png`);
            };

            imageGallery.appendChild(imgCard);
        });
    };

    const generateAiImages = async (userPrompt, userImgQuantity) => {
        try {
            generateBtn.setAttribute("disabled", true);
            generateBtn.innerText = "Generating...";
            isImageGenerating = true;

            // Clear existing images
            imageGallery.innerHTML = "";

            // Send a request to the Hugging Face API to generate images based on user inputs
            const response = await fetch("https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HUGGING_FACE_API_KEY}`,
                },
                body: JSON.stringify({
                    inputs: userPrompt,
                    options: {
                        wait_for_model: true,
                        n: parseInt(userImgQuantity),
                    },
                }),
            });

            // Throw an error message if the API response is unsuccessful
            if (!response.ok) throw new Error("Failed to generate AI images. Make sure your API key is correct and you have enough quota.");

            const responseData = await response.json();

            // Ensure the responseData is in the expected format
            if (responseData && Array.isArray(responseData)) {
                updateImageCard(responseData);
            } else {
                throw new Error("Unexpected response format.");
            }
        } catch (error) {
            alert(error.message);
        } finally {
            generateBtn.removeAttribute("disabled");
            generateBtn.innerText = "Generate";
            isImageGenerating = false;
        }
    };

    generateForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const userPrompt = generateForm.querySelector(".prompt-input").value.trim();
        const userImgQuantity = generateForm.querySelector(".img-quantity").value;

        if (userPrompt && !isImageGenerating) {
            generateAiImages(userPrompt, userImgQuantity);
        }
    });
});

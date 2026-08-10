const BASE_URL = "http://127.0.0.1:8000";

// -------------------- REGISTER --------------------

async function registerUser() {

    const username = document.getElementById("reg_username").value;
    const password = document.getElementById("reg_password").value;
    const role = document.getElementById("reg_role").value;

    if (!username || !password || !role) {
        alert("Please fill all fields");
        return;
    }

    const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
            role
        })
    });

    const data = await response.json();
    if (response.ok) {
    alert("Registration Successful!");
    window.location.href = "login.html";
    } else {
    alert(data.detail);
    }

    if (response.ok) {
        alert("Registration Successful!");

        window.location.href = "index.html";
    }
    else {
        alert(data.detail);
    }

}

// -------------------- LOGIN --------------------

async function loginUser() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const formData = new URLSearchParams();

    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${BASE_URL}/login`, {

        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: formData

    });

    const data = await response.json();

    if (response.ok) {

        localStorage.setItem(
            "token",
            data.access_token
        );

        alert("Login Successful!");

        window.location.href = "dashboard.html";

    }

    else {

        alert(data.detail);

    }

}
// -------------------- LOGOUT --------------------

function logoutUser() {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "index.html";
}

// -------------------- PLACEHOLDERS --------------------

function viewFeedback() {
    alert("Coach Feedback page will be implemented next.");
}

function viewContent() {
    alert("Learning Content page will be implemented next.");
}
// -------------------- SUBMIT DEBATE --------------------

async function submitDebate() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    const topic = document.getElementById("topic").value;
const argument = document.getElementById("argument").value;

if (topic === "" || argument.trim() === "") {
    alert("Please select a topic and enter your argument.");
    return;
}

    const response = await fetch(`${BASE_URL}/debates`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
        topic: topic,
        argument: argument
    })
});

    const data = await response.json();

    if (response.ok) {

    alert(
        `✅ ${data.message}

Score: ${data.score}/100

Strengths:
• ${data.strengths.join("\n• ")}

Logical Fallacy:
${data.logical_fallacy}

Counter Argument:
${data.counter_argument}

Suggestion:
${data.suggestion}`
    );

    document.getElementById("topic").value = "";
    document.getElementById("argument").value = "";

    window.location.href = "dashboard.html";

} else {

    alert(data.detail);

}
}
// -------------------- PRESENTATION UPLOAD --------------------

async function uploadPresentation() {

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const fileInput = document.getElementById("presentationFile");

    if (!fileInput || fileInput.files.length === 0) {
        alert("Please select a presentation.");
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {

        const response = await fetch(
            `${BASE_URL}/presentation/upload`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Presentation upload failed.");
            return;
        }

        // Save result
        localStorage.setItem(
            "presentation_result",
            JSON.stringify(data)
        );

        // Redirect
       window.open("presentation_result.html", "_self");

    } catch (error) {

        console.error("Presentation upload error:", error);
        alert("Something went wrong while analyzing the presentation.");

    }
}
// ---------------- Presentation Result ----------------

if (window.location.pathname.includes("presentation_result.html")) {

    const result = JSON.parse(
        localStorage.getItem("presentation_result")
    );

    if (result) {

        document.getElementById("filename").innerText =
            result.filename;

        document.getElementById("uploadedby").innerText =
            result.uploaded_by;

        document.getElementById("preview").innerText =
            result.preview;

    }

}

// ---------------- Debate History ----------------

async function loadHistory() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(`${BASE_URL}/debates`, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Unable to load debate history.");
            return;
        }

        const table = document.getElementById("historyTable");
        const noHistory = document.getElementById("noHistory");

        table.innerHTML = "";

        if (!data || data.length === 0) {

            noHistory.style.display = "block";
            return;

        }

        noHistory.style.display = "none";

        data.forEach((item, index) => {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    <strong>${item.topic}</strong>
                </td>

                <td>
                    ${item.argument}
                </td>
            `;

            table.appendChild(row);

        });

    } catch (error) {

        console.error("History error:", error);

        alert("Unable to load debate history.");

    }

}


if (window.location.pathname.includes("history.html")) {

    loadHistory();

}

// ---------------- Dashboard Stats ----------------

async function loadDashboardStats(){

    const token = localStorage.getItem("token");

    const response = await fetch(`${BASE_URL}/dashboard/stats`,{

        headers:{
            "Authorization":`Bearer ${token}`
        }

    });

    const data = await response.json();

    document.getElementById("totalDebates").innerText =
        data.total_debates;

    document.getElementById("averageScore").innerText =
        data.average_score;

    document.getElementById("presentations").innerText =
        data.presentations_uploaded;

}

if(window.location.pathname.includes("dashboard.html")){

    loadDashboardStats();

}

async function loadLeaderboard(){

    const response = await fetch(`${BASE_URL}/leaderboard`);

    const data = await response.json();

    const table=document.getElementById("leaderboardTable");

    data.forEach(item=>{

        table.innerHTML+=`

<tr>

<td>${item.user}</td>

<td>${item.score}</td>

</tr>

`;

    });

}

if(window.location.pathname.includes("leaderboard.html")){

    loadLeaderboard();

}

document.addEventListener("DOMContentLoaded", function () {

    const analyzeBtn = document.getElementById("analyzeBtn");

    if (analyzeBtn) {
        analyzeBtn.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            uploadPresentation();

            return false;
        });
    }

});
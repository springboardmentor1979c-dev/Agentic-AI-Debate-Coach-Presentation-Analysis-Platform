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

        const breakdown = data.performance_breakdown;

        document.getElementById("argumentQuality").innerHTML =
            `<span class="badge bg-primary">${breakdown.argument_quality}/100</span>`;

        document.getElementById("evidenceUsage").innerHTML =
            `<span class="badge bg-primary">${breakdown.evidence_usage}/100</span>`;

        document.getElementById("logicalConsistency").innerHTML =
            `<span class="badge bg-primary">${breakdown.logical_consistency}/100</span>`;

        document.getElementById("rebuttalEffectiveness").innerHTML =
            `<span class="badge bg-primary">${breakdown.rebuttal_effectiveness}/100</span>`;

        document.getElementById("communicationSkills").innerHTML =
            `<span class="badge bg-primary">${breakdown.communication_skills}/100</span>`;

        document.getElementById("analysisResult").classList.remove("d-none");

        window.scrollTo({
            top: document.getElementById("analysisResult").offsetTop,
            behavior: "smooth"
        });

    } else {

        alert(data.detail || "Failed to submit debate.");

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

        // Display result on the same page
        const result = data.presentation_metrics || {};

        document.getElementById("speechPace").textContent =
            result.speech_pace_wpm ?? 0;

        document.getElementById("fillerWords").textContent =
            result.filler_word_count ?? 0;

        document.getElementById("confidenceScore").textContent =
            result.confidence_score ?? 0;

        document.getElementById("clarityScore").textContent =
            result.clarity_score ?? 0;

        document.getElementById("engagementScore").textContent =
            result.audience_engagement_score ?? 0;

        document.getElementById("overallScore").textContent =
            result.overall_presentation_score ?? 0;

        document.getElementById("presentationResult").style.display =
            "block";

        window.scrollTo({
            top: document.getElementById("presentationResult").offsetTop,
            behavior: "smooth"
        });

    } catch (error) {

        console.error("Presentation upload error:", error);

        alert(
            "Something went wrong while analyzing the presentation."
        );
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
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

    const response = await fetch(`${BASE_URL}/debates`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (response.ok) {
        alert("Backend Connected!\n\n" + JSON.stringify(data, null, 2));
    } else {
        alert(data.detail);
    }
}
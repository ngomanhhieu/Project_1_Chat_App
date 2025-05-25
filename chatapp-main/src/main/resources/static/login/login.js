document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector(".clkbtnlogin");
    const emailInput = document.querySelector(".emaillog.ele");
    const passwordInput = document.querySelector(".passwordlog.ele");
    const signupLink = document.querySelector(".signup-link");

    // Vô hiệu hóa nút Login ban đầu
    loginButton.disabled = true;
    loginButton.style.opacity = "0.4";

    // Kiểm tra input để kích hoạt nút login
    function validateInputs() {
        if (emailInput.value.trim() !== "" && passwordInput.value.trim() !== "") {
            loginButton.disabled = false;
            loginButton.style.opacity = "1";
        } else {
            loginButton.disabled = true;
            loginButton.style.opacity = "0.6";
        }
    }

    emailInput.addEventListener("input", validateInputs);
    passwordInput.addEventListener("input", validateInputs);

    // Xử lý sự kiện click Login
    loginButton.addEventListener("click", () => {
        let username = emailInput.value.trim();
        let password = passwordInput.value.trim();

        const loginInfo = {
            username: username,
            password: password
        };

        fetch('/app/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginInfo)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { 
                        throw new Error(text);
                    });
                }
                return response.text();
            })
            .then(session_id => {
                console.log('Login successful, session_id:', session_id);
                window.location.href = '/mainchat/' + session_id;
            })
            .catch(error => {
                console.error('Error:', error);
                try {
                    let errorObj = JSON.parse(error.message);
                    if (errorObj.error) {
                        alert("Login Error: " + errorObj.error);
                    } else {
                        alert("Unknown login error occurred.");
                    }
                } catch {
                    alert("An unexpected error occurred: " + error.message);
                }
            });
    });

    // Chuyển hướng khi ấn "Sign up"
    signupLink.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = "/signup";
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.querySelector(".passwordlog.ele");
    const showPasswordToggle = document.getElementById("show-password");

    showPasswordToggle.addEventListener("change", () => {
        passwordInput.type = showPasswordToggle.checked ? "text" : "password";
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");
    const loginLink = document.getElementById("loginLink");

    // Chuyển hướng sang trang đăng nhập khi nhấn vào link
    loginLink.addEventListener("click", function (event) {
        event.preventDefault();
        window.location.href = "/login";
    });

    signupForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Ngăn chặn reload trang

        // Lấy giá trị từ input
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
		const repassword = document.getElementById("repassword").value.trim();
        const fullName = document.getElementById("fullName").value.trim();

        // Debug dữ liệu nhập vào
        console.log("📌 Email:", email);
        console.log("📌 Password:", password);
        console.log("📌 Full Name:", fullName);

        // Kiểm tra nếu có input nào trống
        if (!email || !password || !fullName) {
            alert("❌ Please fill in all fields.");
            return;
        }
		if (repassword != password){
			alert("Password and repassword not the same.");
			return;
		}

        const signupInfo = { username: email, password, name: fullName };

        console.log("📤 Sending request:", signupInfo);

        // Gửi request đến API `/signup`
        fetch("/app/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(signupInfo)
        })
        .then(response => {
            console.log("🔍 HTTP Status Code:", response.status); // Kiểm tra status code

            // Nếu server trả về lỗi, đọc lỗi trước khi parse JSON
            if (!response.ok) {
                return response.text().then(text => {
                    console.error("❌ Server Error Response:", text);
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                });
            }

            return response.text(); // Lấy dữ liệu response dưới dạng text
        })
		.then(text => {
		    console.log("📥 Raw API Response:", text);

		    if (/^[a-f0-9-]{36}$/.test(text.trim())) {
		        console.log("✅ Detected UUID response:", text.trim());
		        return { session_id: text.trim() };
		    }
		    try {
		        const jsonData = JSON.parse(text);
		        console.log("✅ Parsed JSON Response:", jsonData);
		        return jsonData;
		    } catch (e) {
		        console.error("❌ JSON Parse Error:", e, "Raw response:", text);
		        throw new Error("❌ Response is not valid JSON.");
		    }
		})
        .then(data => {
            console.log("✅ Signup successful:", data);
            alert("🎉 Signup successful! Redirecting to login...");
            window.location.href = "/login";
        })
        .catch(error => {
            console.error("❌ Error:", error);
            alert("❌ Signup failed. Please try again.");
        });
    });
});

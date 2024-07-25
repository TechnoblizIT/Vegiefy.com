     // js for navbar
     const navbarMenu = document.querySelector(".navbar .links");
     const hamburgerBtn = document.querySelector(".hamburger-btn");
     const hideMenuBtn = navbarMenu.querySelector(".close-btn");
     const showPopupBtn = document.querySelector(".login-btn");
     
     // Show mobile menu
     hamburgerBtn.addEventListener("click", () => {
         navbarMenu.classList.toggle("show-menu");
     });
     
     // Hide mobile menu
     hideMenuBtn.addEventListener("click", () =>  hamburgerBtn.click());
     
     // js for footer section
     document.addEventListener("DOMContentLoaded", function() {
        const btn = document.querySelector('.contact-btn');
     
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Your message has been sent!');
        });
     });
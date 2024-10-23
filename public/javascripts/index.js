 // js for nav bar Mobile menu toggle
 const hamburgerBtn = document.querySelector('.hamburger-btn');
 const navbarMenu = document.querySelector('.nav-links');
 
 hamburgerBtn.addEventListener('click', () => {
   navbarMenu.classList.toggle('show-menu');
 });
 
 document.querySelectorAll('.nav-links a').forEach(link => {
   link.addEventListener('click', function() {
     // Remove active class from all links
     document.querySelector('.nav-active')?.classList.remove('nav-active');
     
     // Add active class to the clicked link
     this.classList.add('nav-active');
   });
 });
 

  // js for footer section
 document.addEventListener("DOMContentLoaded", function() {
    const btn = document.querySelector('.contact-btn');
 
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Your message has been sent!');
    });
 });
 
 
 // js for hero slide
 let currentSlide = 0;
 const slides = document.querySelectorAll('.hero-slide');
 
 function showSlide(index) {
   slides.forEach((slide, i) => {
     slide.classList.remove('active');
     if (i === index) {
       slide.classList.add('active');
       slide.style.opacity = '1'; 
     } else {
       slide.style.opacity = '0'; 
     }
   });
 }
 
 function nextSlide() {
   currentSlide = (currentSlide + 1) % slides.length;
   showSlide(currentSlide);
 }
 
 function prevSlide() {
   currentSlide = (currentSlide - 1 + slides.length) % slides.length;
   showSlide(currentSlide);
 }
 
 setInterval(nextSlide, 4000);
 showSlide(currentSlide);
 
 //  js for product slider
 document.addEventListener("DOMContentLoaded", function () {
  var swiper = new Swiper('.product-slider', {
    loop: true,
    spaceBetween: 20,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      500: {
        slidesPerView: 2,
      },
      1000: {
        slidesPerView: 3,
      },
      1200: { 
        slidesPerView: 4,
      },
    },
  });
});

// js for search-dropdown======================================================================================================
const searchInput = document.getElementById('search-input');
const dropdown = document.getElementById('dropdown');

// Show dropdown when input is focused
function showDropdown() {
    dropdown.style.display = 'block';
}

// Hide dropdown when clicking outside
function hideDropdown() {
    setTimeout(() => {
        if (!dropdown.contains(document.activeElement)) {
            dropdown.style.display = 'none';
        }
    }, 100);
}

// Add event listeners to dropdown items
document.querySelectorAll('.dropdown li').forEach(item => {
    item.addEventListener('mousedown', function() {
        searchInput.value = this.textContent; 
        dropdown.style.display = 'none';
    });
});

// Hide dropdown if clicked outside of the dropdown or input
window.addEventListener('mousedown', function(event) {
    if (!searchInput.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});
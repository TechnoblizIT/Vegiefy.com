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
 
 
 // JS for Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.hero-slide');

function showSlide(index) {
  slides.forEach((slide, i) => {
    if (i === index) {
      slide.classList.add('active');
      slide.style.opacity = '1'; 
      slide.style.pointerEvents = 'auto'; 
    } else {
      slide.classList.remove('active');
      slide.style.opacity = '0'; 
      slide.style.pointerEvents = 'none'; 
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

// Auto slide every 5 seconds
setInterval(nextSlide, 5000);

// Initial setup
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

 // js for FAQs

 document.addEventListener("DOMContentLoaded", function() {
  const questions = document.querySelectorAll(".question");

  questions.forEach(function(question) {
      question.addEventListener("click", function() {
          const answer = this.nextElementSibling;
          this.classList.toggle("active");
          answer.classList.toggle("active");
          this.parentNode.classList.toggle("active");
      });
  });
});

let fuse;

async function fetchProducts() {
const input = document.getElementById('search-input').value.toLowerCase();

if (input.length === 0) {
  document.getElementById('dropdown').style.display = 'none';
  return; // Hide the dropdown if input is empty
} else {
  document.getElementById('dropdown').style.display = 'block';
}

try {
  // Fetch all products from the backend
  const response = await fetch('/search?q=');
  const products = await response.json();

  
  fuse = new Fuse(products, {
    keys: ['name'], 
    threshold: 0.4, 
  });

 
  const result = fuse.search(input);
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';

  if (result.length === 0) {
    productList.innerHTML = '<li>No products found</li>';
  } else {
    
    result.forEach(({ item }) => {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.addEventListener('click', () => {
        window.location.href = `/productdetails/${item._id}`; 
      });
      productList.appendChild(li);
    });
  }

} catch (error) {
  console.error('Error fetching products:', error);
}
}

// Hide dropdown when clicking outside (optional)
document.addEventListener('click', function(event) {
const dropdown = document.getElementById('dropdown');
const searchInput = document.getElementById('search-input');
if (!dropdown.contains(event.target) && event.target !== searchInput) {
  dropdown.style.display = 'none';
}
});


// js for gallery section
// function openLightbox(el) {
//   document.getElementById('lightbox-img').src = el.querySelector('img').src;
//   document.getElementById('lightbox').style.display = 'flex';
// }
// function closeLightbox() {
//   document.getElementById('lightbox').style.display = 'none';
// }

// Scroll-reveal fade-in & untwist
// document.addEventListener('DOMContentLoaded', () => {
//   const items = document.querySelectorAll('.item');
//   const obs = new IntersectionObserver(entries => {
//     entries.forEach(e => {
//       if (e.isIntersecting) {
//         e.target.classList.add('visible');
//         obs.unobserve(e.target);
//       }
//     });
//   }, { threshold: 0.2 });
//   items.forEach(i => obs.observe(i));
// });


  function openLightbox(icon) {
    const img = icon.previousElementSibling;
    document.getElementById("lightboxImage").src = img.src;
    document.getElementById("lightboxModal").classList.add("show");
  }

  function closeLightbox() {
    document.getElementById("lightboxModal").classList.remove("show");
  }


const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#nav-hamburger-menu');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);

// For changing quantity of cart
const quantities = document.getElementsByName('quantity');
quantities.forEach((qty, i) => {
  const initialQtyValue = qty.value;

  qty.onkeyup = e => {
    if (qty.value !== initialQtyValue && qty.value !== '') {
      document.getElementById(`a-autoid-${i}`).classList.remove('aok-hidden');
    } else {
      document.getElementById(`a-autoid-${i}`).classList.add('aok-hidden');
    }
  };

  qty.onkeydown = e => {
    // console.log(e);
    // console.log(qty.value);
    // console.log(initialQtyValue);
    // console.log(initialQtyValue + e.key);

    if (
      e.keyCode >= 48 &&
      e.keyCode <= 57 &&
      qty.value + e.key !== '' &&
      qty.value + e.key !== initialQtyValue
    ) {
      document.getElementById(`a-autoid-${i}`).classList.remove('aok-hidden');
    } else {
      document.getElementById(`a-autoid-${i}`).classList.add('aok-hidden');
    }
  };
});
// end of changing quantity value of cart

document.querySelector('.nav-search-dropdown').onchange = function(e) {
  document.querySelector('.nav-search-label').innerHTML =
    e.target.selectedOptions[0].innerText;
};

// LOGIC FOR CALCULATING DELIVERY DATE
// Set the date we're counting down to
var currentDate = new Date();
if (currentDate.getHours() < 18) {
  var countDownDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    18
  ).getTime();
} else {
  currentDate.setDate(currentDate.getDate() + 1);
  var countDownDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    18
  ).getTime();
}

// Update the count down every 1 second
var x = setInterval(function() {
  // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for hours, minutes and seconds

  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Output the result for all elements with class="countdown"
  var divs = document.getElementsByClassName('countdown');
  if (distance < 0) {
    // If past 9PM ET, guarenteer no longer valid
    [].slice.call(divs).forEach(function(div) {
      div.innerHTML = `We're sorry. Today's deadline for guaranteed delivery date has expired. Please reselect your shipping speed to see updated shipping information.`;
    });
  } else {
    [].slice.call(divs).forEach(function(div) {
      div.innerHTML = `If you order in the next ${hours} hours and ${minutes} minutes`;
    });
  }
}, 1000);

$('input[name="quantity"]').bind({
  keydown: function(e) {
    if (e.keyCode === 8 || e.keyCode === 13) return true;
    if (e.keyCode > 57) {
      return false;
    }
    if (e.keyCode < 48) {
      return false;
    }
    return true;
  }
});

// LIMIT TITLE NAME FOR MOBILE
const limitTitle = (title, limit) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(' ').reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);

    // return the result
    return `${newTitle.join(' ')} ...`;
  }
  return title;
};

updateProductTitle();

function updateProductTitle() {
  const limit = 25;

  if (window.innerWidth < 500) {
    const titles = [].slice.call(
      document.getElementsByClassName('product-title')
    );
    titles.forEach(title => {
      if (
        title.innerText.substring(0, title.innerText.length - 4).length >
          limit &&
        title.innerText.substring(
          title.innerText.length - 4,
          title.innerText.length - 1
        ) != '...'
      ) {
        title.innerText = limitTitle(title.innerText, limit);
      }
    });
  }
}

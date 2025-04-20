document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    alert("You must log in first.");
    return (window.location.href = "/login");
  }

  fetch(`/potential-matches/${user.email}`)
    .then(res => res.json())
    .then(matches => {
      const container = document.getElementById('card-container');
      container.innerHTML = '';

      if (!matches.length) {
        container.innerHTML = "<p class='no-matches-msg'>Nobody in your area.</p>";
        return;
      }

      matches.forEach(renderSwipeCard);
      enableSwiping();
      setupIconButtons();
    })
    .catch(err => {
      console.error("Error fetching matches:", err);
      container.innerHTML = "<p>Error loading matches.</p>";
    });
});

// Renders a single user into a swipe card
function renderSwipeCard(user) {
  const container = document.getElementById('card-container');

  const card = document.createElement('div');
  card.className = 'swipe-card';
  card.dataset.userid = user.id;

  card.innerHTML = `
    <div class="swipe-media">
      <img src="${user.profile.media?.[0] || '/img/placeholder.jpg'}" alt="${user.profile.name}'s media">
    </div>
    <div class="swipe-info">
      <h3>${user.profile.name}, ${user.profile.age || '?'}</h3>
      <p><strong>${user.profile.role || ''}</strong> • ${user.distance || '?'} km away</p>
      <p class="bio">${user.profile.description || ''}</p>
    </div>
    <div class="icon-label">
      <i class="fas fa-times pass-icon" data-direction="pass"></i>
      <i class="fas fa-heart like-icon" data-direction="like"></i>
    </div>
  `;

  container.appendChild(card);
}

// Handles swiping logic via drag gestures
function enableSwiping() {
  const cards = document.querySelectorAll('.swipe-card');

  cards.forEach(card => {
    let startX = 0, currentX = 0, isDragging = false;

    const start = (x) => {
      isDragging = true;
      startX = x;
      card.style.transition = 'none';
    };

    const move = (x) => {
      if (!isDragging) return;
      currentX = x - startX;
      card.style.transform = `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`;
    };

    const end = () => {
      if (!isDragging) return;
      isDragging = false;
      card.style.transition = 'transform 0.3s ease';

      if (Math.abs(currentX) > 120) {
        const direction = currentX > 0 ? 'like' : 'pass';
        card.style.transform = `translateX(${currentX > 0 ? 1000 : -1000}px) rotate(${currentX * 0.1}deg)`;
        setTimeout(() => {
          card.remove();
          handleSwipeResult(direction, card);
        }, 300);
      } else {
        card.style.transform = '';
      }

      currentX = 0;
    };

    card.addEventListener('mousedown', e => start(e.clientX));
    card.addEventListener('mousemove', e => move(e.clientX));
    card.addEventListener('mouseup', end);
    card.addEventListener('mouseleave', () => isDragging && end());

    card.addEventListener('touchstart', e => start(e.touches[0].clientX));
    card.addEventListener('touchmove', e => move(e.touches[0].clientX));
    card.addEventListener('touchend', end);
  });
}

// For tapping icons (like/pass)
function setupIconButtons() {
  document.querySelectorAll('.like-icon, .pass-icon').forEach(icon => {
    icon.addEventListener('click', (e) => {
      const card = e.target.closest('.swipe-card');
      const direction = e.target.dataset.direction;

      card.style.transform = `translateX(${direction === 'like' ? 1000 : -1000}px) rotate(${direction === 'like' ? 15 : -15}deg)`;
      setTimeout(() => {
        card.remove();
        handleSwipeResult(direction, card);
      }, 300);
    });
  });
}

// Sends swipe data to backend
function handleSwipeResult(direction, card) {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  const targetId = card.dataset.userid;

  fetch('/swipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, targetId, direction })
  });

  console.log(`${direction.toUpperCase()} → ${card.querySelector('h3')?.textContent}`);
}
export function renderData(data) {
  const container = document.getElementById('fitList');
  container.innerHTML = "";

  // Create a frontned div element for each excercise
  data.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'fit_item';
    div.innerHTML = `
      <h4>${index + 1}. ${item.name}</h4>
      <div class="fit-img-container">
      <img src="https://storage.googleapis.com/poc_frontend/${item.id}.jpg" alt="${item.name}">
      </div>
      <h5>Description:</h5>
      <p class="desc" >${item.desc}</p>
    `;
    container.appendChild(div);
  });
}




function showModal(content, stack = false) {
  if (!content || content === '') {
    throw new Error('Modal must contain content');
  }

  // Query modal element
  let modal = document.querySelector('.modal-backdrop');

  // Ensure modal element exists
  if (stack || !(modal instanceof Element)) {
    modal = document.createElement('div');
    modal.classList.add('modal-backdrop', 'relative', 'hidden');
    document.body.appendChild(modal);
  }

  // Query modal body if one exists
  let modalBody = modal.querySelector('.modal-body');

  // Create a modal body if one doesn't exist
  if (!(modalBody instanceof Element)) {
    modalBody = document.createElement('div');
    modalBody.classList.add('modal-body');
    modal.appendChild(modalBody);
  }

  // Set modal body inner HTML to content
  modalBody.innerHTML = content;

  // Show modal
  modal.classList.remove('hidden');

  return modal;
}

function hideModal(event = null, modalID) {
  if (event) {
    event.preventDefault();
  }

  const modalBackdrop = modalID
    ? document.getElementById(modalID)
    : document.querySelector('.modal-backdrop');

  if (modalBackdrop instanceof Element) {
    // Hide modal element
    modalBackdrop.classList.add('hidden');

    // Empty modal body
    modalBackdrop.querySelector('.modal-body').innerHTML = '';
  }
}
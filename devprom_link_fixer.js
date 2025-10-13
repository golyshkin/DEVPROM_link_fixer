document.addEventListener(
  'click',
  async function (e) {
    // Находим ближайшую кнопку
    const button = e.target.closest('button.clipboard, a.clipboard');

    // Если это не кнопка — выходим
    if (!button) return;

    // Проверяем наличие класса 'clipboard'
    if (!button.classList.contains('clipboard')) return;

    // Берём текст из data-clipboard-text
    const originalText = button.getAttribute('data-clipboard-text');
    if (!originalText) return;
    let reqCaption = null
    const parts = originalText.split(' - ');

    if (parts.length === 2) {
      const numberPart = parts[1].trim();
      if (/^\d+$/.test(numberPart)) {
        const captionId = 'WikiPageCaption' + numberPart
        console.log('The DEVPROM requirement id: ', captionId);
        captionElement = document.getElementById(captionId)
        if (captionElement) {
          reqCaption = ' ' + captionElement.innerText;
          console.log('The DEVPROM requirement caption: ', reqCaption);
        } else {
          const elements = document.querySelectorAll(`[objectid="${numberPart}"]`);
          const firstWithTitle = Array.from(elements).find(el => el.hasAttribute('title'));
          if (firstWithTitle) {
            reqCaption = ' ' + firstWithTitle.innerText;
          } else {
            console.log('The DEVPROM requirement is not found: ', numberPart);
          }
        }
      }
    }

    // Заменит пробелы, кириллицу, и др.
    const modifiedText = encodeURI(originalText) + (reqCaption ?? '');

    // Блокируем поведение оригинального обработчика
    e.preventDefault();
    e.stopImmediatePropagation();

    // Копируем в буфер обмена
    try {
      await navigator.clipboard.writeText(modifiedText);
      console.log('The DEVPROM requirement copied to clipboard:', modifiedText);
    } catch (err) {
      console.error('The DEVPROM requirement copy to clipboard ERROR:', err);
    }
    // Удалить меню только если это <a>
    if (button.tagName.toLowerCase() === 'a') {
        const menu = button.closest('div.dropdown-fixed');
        if (menu && menu.classList.contains('open')) {
          console.log('The DEVPROM drop-down menu is removed');
          menu.remove();
        }
    }
  },
  true // Перехватывающее событие (на фазе захвата)
);

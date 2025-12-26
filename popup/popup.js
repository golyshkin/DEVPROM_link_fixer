document.addEventListener('DOMContentLoaded', function() {
  const textInput = document.getElementById('textInput');
  const saveButton = document.getElementById('saveButton');
  const status = document.getElementById('status');
  const error = document.getElementById('error');
  const rDefaultId = document.getElementById('rdefault');
  const rJiraId = document.getElementById('rjira');
  const rMdId = document.getElementById('rmd');

  browser.storage.local.get('savedText').then(function(result) {
    if (result.savedText) {
      textInput.value = result.savedText;
      status.textContent = 'Loaded.';
      setTimeout(() => status.textContent = '', 2000);
    }
  });

  browser.storage.local.get('option').then(function(result) {
    if (result.option) {
      document.getElementById( result.option ).checked = true;
    }
  });

  rDefaultId.addEventListener('click', function() 
  {
     browser.storage.local.set({ option: "rdefault" });

     textInput.value = "${url} - ${desc}";
     const simChangeEvent = new Event('input', { 'bubbles': true });
     
     textInput.dispatchEvent(simChangeEvent);
  });

  rJiraId.addEventListener('click', function() 
  {
     browser.storage.local.set({ option: "rjira" });

     textInput.value = "[${desc}|${url}]";
     const simChangeEvent = new Event('input', { 'bubbles': true });

     textInput.dispatchEvent(simChangeEvent);
  });

  rMdId.addEventListener('click', function() 
  {
     browser.storage.local.set({ option: "rmd" });

     textInput.value = "[[${url} ${desc}]]";
     const simChangeEvent = new Event('input', { 'bubbles': true });

     textInput.dispatchEvent(simChangeEvent);
  });

  saveButton.addEventListener('click', function() {
    window.close();
  });

  // Автосохранение при изменении текста (опционально)
  let saveTimeout;
  textInput.addEventListener('input', function() 
  {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(function() 
    {
      const text = textInput.value;
      if ( checkInput( text ) )
      {
			browser.storage.local.set({ savedText: text });
			status.textContent = 'Autosave...';
      }
      else
      {
	      error.textContent = 'Error! Template invalid.';
      }
      
      setTimeout(() => status.textContent = '', 1000);
      setTimeout(() => error.textContent = '', 1000);
    }, 500);
  });
});

function checkInput( text )
{
	return text.includes( "${url}" ) || text.includes( "${desc}" )
}
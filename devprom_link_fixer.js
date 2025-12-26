document.addEventListener(
  'click',
  async function (e) {
    // get nearest button
    const button = e.target.closest('button.clipboard, a.clipboard');

    if (!button) return;

    // check clipboard
    if (!button.classList.contains('clipboard')) return;

    // get data from clipboard
    const originalText = button.getAttribute('data-clipboard-text');
    if (!originalText) return;
    let reqCaption = null
    const parts = originalText.split(' - ');

    if (parts.length === 2) 
    {
      const numberPart = parts[1].split( "?" )[0].trim();

      if (/^\d+$/.test(numberPart)) {
        const captionId = 'WikiPageCaption' + numberPart
        console.log('The DEVPROM requirement id: ', captionId);
        captionElement = document.getElementById(captionId)

        if ( captionElement ) 
        {
          reqCaption = captionElement.innerText;
          console.log('The DEVPROM requirement caption: ', reqCaption);
        } 
        else 
        {
          reqCaption = getTitle( numberPart );

          if ( reqCaption.length == 0 )
          {
             // One more chance to find a fucking DEVPROM requirement title
             const elements = document.querySelectorAll(`[objectid="${numberPart}"]`);
             const firstWithTitle = Array.from(elements).find(el => el.hasAttribute('title'));
    
             if (firstWithTitle) 
             {
               reqCaption = firstWithTitle.innerText;
             } 
             else 
             {
               console.log('The DEVPROM requirement is not found: ', numberPart);
             }
          }
        }
      }
    }
    else
    {
       const parts = originalText.split( "/")
       const title = parts[ parts.length - 1].split("?")[0]

	    reqCaption = getTitle( title );
    }

    pattern = "${url} + ${desc}";

    await browser.storage.local.get('savedText').then(function(result) 
    {
      if (result.savedText) 
      {
        pattern = result.savedText;
      }
    });

	 console.log( pattern );
    
    // Final transform
    modifiedText = pattern.replace( "${url}", encodeURI(originalText) );
    modifiedText = modifiedText.replace( "${desc}", reqCaption );

    // consume event
    e.preventDefault();
    e.stopImmediatePropagation();

    // copy to clipboard
    try {
      const htmlLink = "<a href=\"" + encodeURI(originalText) + "\">" + reqCaption + "</a>";
      const htmlContent = new Blob([htmlLink], { type: 'text/html' });
      const textContent = new Blob([modifiedText], { type: 'text/plain' });
		const clipboardItem = new ClipboardItem({
				'text/html': htmlContent,
				'text/plain': textContent
				});
      
      await navigator.clipboard.write([clipboardItem]);      
      
      //await navigator.clipboard.writeText(modifiedText);
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
  true // register event
);

function getTitle( findStr )
{
   const elements = document.getElementsByClassName("fancytree-title");

   if ( elements.length > 0 )
   {
      for ( let i = 0; i < elements.length; i++ ) 
      {
         if ( elements[i].innerText.includes( findStr ) ) 
         {
             const splitCaption = elements[i].innerText.split(findStr).map(splitCaption => splitCaption.trim());
             let reqCaption = splitCaption[splitCaption.length - 1];

             console.log('The DEVPROM requirement caption: ', reqCaption);
             return reqCaption;
         }
      }
   }
    
   return "";
}
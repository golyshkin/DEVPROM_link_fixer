const browser = globalThis.browser || chrome;
const DEFAULT_TEXT = "The original DEVPROM link format...";

document.addEventListener(
  'click',
  async function (e) {
    // get nearest button
    const button = e.target.closest('button.clipboard, a.clipboard');

    // check data in clipboard and pressed CTRL key to skip URL conversation
    if ( ( !button && !button.classList.contains('clipboard') ) || e.ctrlKey || e.metaKey ) return;

    // get data from clipboard
    let reqCaption = null;
    let captionId = null;
    let reqId = 0;

    const originalText = button.getAttribute('data-clipboard-text');

    if (!originalText) return;
    
    const urlParts = originalText.split('/');
    const lastUrlPart = urlParts[urlParts.length - 1];
    const projectId = lastUrlPart.split('.')[0];

    // This is a magical calculation, because DEVPROM implements different ways to create URLs. It's unbelievable, but a fact!
    const parts1 = originalText.split('%20-%20');
    const parts2 = originalText.split('+-+');
    const parts = parts1.length > parts2.length ? parts1 : parts2;

    if ( parts.length === 2 ) 
    {
      reqId = parts[1].split( "?" )[0].trim();

      if (/^\d+$/.test(reqId)) 
      {
        captionId = 'WikiPageCaption' + reqId
        console.log('The DEVPROM requirement id: ', captionId);
        captionElement = document.getElementById(captionId)

        if ( captionElement ) 
        {
          reqCaption = captionElement.innerText;
          console.log('The DEVPROM requirement caption: ', reqCaption);
        } 
        else 
        {
          reqCaption = getTitle( reqId );

          if ( reqCaption.length == 0 )
          {
             // One more chance to find a fucking DEVPROM requirement title
             const elements = document.querySelectorAll(`[objectid="${reqId}"]`);
             const firstWithTitle = Array.from(elements).find(el => el.hasAttribute('title'));
             
             if (firstWithTitle) 
             {
               reqCaption = firstWithTitle.innerText;
             } 
             else 
             {
               console.log('The DEVPROM requirement is not found: ', reqId);
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

    // Template is used by default if there is no saved yet
    pattern = "${url} - ${desc} - [${id}]";

    await browser.storage.local.get('savedText').then(function(result) 
    {
       pattern = result.savedText == DEFAULT_TEXT ? null : result.savedText;
    });

    let modifiedText = null;
    let htmlLink = null;

    if ( pattern != null )
    {
       console.log( pattern );
    
       // Final transform
       modifiedText = pattern.replace( "${url}", encodeURI(originalText) );
       modifiedText = modifiedText.replace( "${id}", reqId );
       modifiedText = modifiedText.replace( "${desc}", reqCaption );
       // The HTML format is hardcoded
       htmlLink = "<a class=\"uid with-tooltip\" info=\"/pm/" + projectId + "/tooltip/Requirement/" + reqId + "\" data-placement=\"right\" data-cke-saved-href=\"" + encodeURI( originalText ) + "\" href=\"" + encodeURI( originalText ) + "\" target=\"_blank\" title=\"\">" + reqCaption + " - [" + reqId + "]</a>";

    }
    else
    {
    	// Default URL formatter is selected
		htmlLink = modifiedText = originalText;
    }

    // Consume event
    e.preventDefault();
    e.stopImmediatePropagation();

    // copy to clipboard
    try {
      const htmlContent = new Blob([htmlLink], { type: 'text/html' });
      const textContent = new Blob([modifiedText], { type: 'text/plain' });
      const clipboardItem = new ClipboardItem({
         'text/html': htmlContent,
         'text/plain': textContent
      });
      
      await navigator.clipboard.write([clipboardItem]);      
      
      console.log('The DEVPROM requirement copied to clipboard:', modifiedText);
    } catch (err) {
      console.error('The DEVPROM requirement copy to clipboard ERROR:', err);
    }
    // Close dropdown menu if the clicked element is <a>
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
   let reqCaption = "";

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

   // Lets search in Requirements Registry
   if ( reqCaption == "" )
   {
      const targetRow = document.querySelector( `tr[object-id="${findStr}"]` );

      if ( targetRow ) 
      {
         reqCaption = targetRow.querySelector('.fancytree-title');
    
         reqCaption = reqCaption ? reqCaption.textContent.trim() : "";
      } 
   }

   // Lets search in context pop-up window
   if ( reqCaption == "" )
   {
      const elements = document.querySelectorAll('button.clipboard, .tt-field-data');
      let foundText = null;

      for (const element of elements) 
      {
          const parentDiv = element.closest('.tt-field-data');

          if ( parentDiv && parentDiv.textContent.includes( findStr ) ) 
          {
              const fullText = parentDiv.textContent;
              const parts = fullText.split( '/' );

              if ( parts.length > 1 )
              {
                 reqCaption = parts[ parts.length - 1 ].trim();
              }

              break;
          }
      }   
   }
    
   return reqCaption;
}

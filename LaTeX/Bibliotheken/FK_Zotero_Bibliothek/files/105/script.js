$(document).ready(function () {
  if ((window.location.pathname).indexOf('/about/careers') === -1) {
    document.cookie = 'filterCookieForCareers=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
  }

  $('.global-language .language-list li a').click(function () {
    console.log('langlist click', $(this).attr('data-value'))

    document.cookie = 'changeLang=false; path=/;'
    /*
    if ($(this).attr('data-value') === '/') {
      console.log('set cookie a')
      document.cookie = 'changeLang=true; path=/;'
    } else {
      console.log('set cookie b')
      document.cookie = 'changeLang=false; path=/;'
    }
    */
  })
})
// function getCookie (cname) {
//   let name = cname + '='
//   let decodedCookie = decodeURIComponent(document.cookie)
//   let ca = decodedCookie.split(';')
//   for (let i = 0; i < ca.length; i++) {
//     let c = ca[i]
//     while (c.charAt(0) === ' ') {
//       c = c.substring(1)
//     }
//     if (c.indexOf(name) === 0) {
//       return c.substring(name.length, c.length)
//     }
//   }
//   return ''
// }

// $(document).ready(function () {
//   if ((window.location.pathname).indexOf('/about/careers') === -1) {
//     document.cookie = 'filterCookieForCareers=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'
//   }
//   let changeLang = getCookie('changeLang') ? JSON.parse(getCookie('changeLang')) : null

//   let browserLanguage = '/' + (navigator.language || navigator.userLanguage).slice(0, 2) + '/'
//   let locales = {
//     '/en/': '/',
//     '/de/': '/de',
//     '/fr/': '/fr',
//     '/ja/': '/jp',
//     '/ko/': '/kr',
//     '/zh/': '/cn',
//     '/es/': '/es',
//     '/pt/': '/pt'
//   }
//   let locationpath = window.location.pathname
//   let currentLocale = locationpath.split('/')[1]
  
//   if (locales[browserLanguage] === undefined) {
//   } else {
//     if (currentLocale === 'fr' || currentLocale === 'de' || currentLocale === 'jp' || currentLocale === 'kr' || currentLocale === 'cn' || currentLocale === 'es' || currentLocale === 'pt') {
//       // console.log('inside current locale if--------------', currentLocale)
//     } else {
//       if (changeLang) {
//       } else {
//         console.log('inside else----------------', browserLanguage)
//         if (browserLanguage !== '/en/') {
//           window.location.href = locales[browserLanguage] + locationpath
//         }
//       }
//     }
//   }

//   $('.global-language .language-list li a').click(function() {
//     if ($(this).attr('data-value') === '/') {
//       document.cookie = 'changeLang=true; path=/;'
//     } else {
//       document.cookie = 'changeLang=false; path=/;'
//     }
//   })
// })

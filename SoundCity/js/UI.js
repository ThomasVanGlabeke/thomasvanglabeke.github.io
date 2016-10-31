// TOGGLE UI INTERFACE - on Keyboard press ECHAP
// Play animation
var toggleUI = true
var UI = document.querySelector('#UIContainer')
window.addEventListener('keydown', function(e) {
    if (e.keyCode == 27) {
        if (toggleUI) {
            UI.style.animationName = 'UIout'
            toggleUI = false
        } else {
            UI.style.animationName = 'UIin'
            toggleUI = true
        }
    }
})
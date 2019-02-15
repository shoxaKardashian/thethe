
let images = document.querySelectorAll('.lazy');
const observer = lozad(images);
observer.observe();

$('#malls-tabs').responsiveTabs({
    startCollapsed: 'tabs',
    disabled: []
});
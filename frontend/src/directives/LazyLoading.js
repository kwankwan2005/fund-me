export default {
    mounted(el, binding) {
        // intersection observer options
        const options = {
            root: null, // viewport as the root
            rootMargin: '0px', // no margin
            threshold: 0.1 // trigger when 10% of the image is visible
        }

        // creating observer
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // if the image is in viewport
                // set the real image URL to the "src" attribute
                // stop observing once it's loaded
                if (entry.isIntersecting) {
                    el.src = binding.value 
                    observer.unobserve(el)
                }
            })
        }, options)

        observer.observe(el) // register the observation of the intersection
    }
}

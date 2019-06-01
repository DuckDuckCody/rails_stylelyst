document.addEventListener('turbolinks:load', function() {
    if (document.getElementById('body').className == 'clothes settings') {
        new Vue({
            el: '#settingsForm',
            data: {
                formData: {
                    gender: undefined,
                    category: undefined,
                    websites: []
                },
                formErrors: [],
                genders: [],
                categories: [],
                websites: [],
                categorySearchBoxQuery: "",
                websiteSearchBoxQuery: ""
            },
            computed: {
                matchedCategories() {
                    return _.filter(this.categories, function(category) {
                        var searchFlag = true;
                        if (this.categorySearchBoxQuery) {
                            searchFlag =  category.name.toLowerCase().indexOf(this.categorySearchBoxQuery.toLowerCase()) !== -1
                        }
                        return category.gender_id == this.formData.gender && searchFlag
                    }.bind(this))
                },
                selectedCategory() {
                    return this.formData.category
                },
                filteredWebsites() {
                    if (this.websiteSearchBoxQuery) {
                        return _.filter(this.websites, function(website) {
                            return website.name.toLowerCase().indexOf(this.websiteSearchBoxQuery.toLowerCase()) !== -1
                        }.bind(this))
                    }
                    return this.websites
                }
            },
            watch: {
                selectedCategory() {
                    this.fetchWebsites()
                }
            },
            created() {
                var settingsForm = document.getElementById('settingsForm')
                this.genders = JSON.parse(settingsForm.dataset.genders)
                this.categories = JSON.parse(settingsForm.dataset.categories)
                this.formData.category =  Cookies.get('category')
                this.formData.gender = Cookies.get('gender')
                this.formData.websites = Cookies.getJSON('websites')
            },
            methods: {
                clickGender: function() {
                    this.formData.category = null;
                    this.websites = []
                },
                fetchWebsites: function() {
                    let request = new Request(
                        '/clothes/website_match',
                        {
                            method: 'POST',
                            body: JSON.stringify({'category': this.formData.category}),
                            headers: new Headers({
                                'Content-Type': 'application/json'
                            })
                        }
                    )
                    fetch(request)
                    .then((res) => res.json())
                    .then((json) => {                       
                        this.websites = json.websites
                        this.fillWebsites()
                    })
                },
                fillWebsites: function() {
                    var websiteCopy = this.formData.websites
                    this.formData.websites = []
                    _.forEach(websiteCopy, function(websiteId) {
                        _.some(this.websites, ['id', websiteId]) ? this.formData.websites.push(websiteId) : ''
                    }.bind(this))
                },
                clickFormSubmit: function() {
                    if (this.formIsValid()) {
                        var options = { expires: 365 }
                        Cookies.set('gender', this.formData.gender, options)
                        Cookies.set('category', this.formData.category, options)
                        Cookies.set('websites', this.formData.websites, options)
                        window.location = "/";
                    }
                },
                formIsValid: function() {
                    if (this.formData.gender && this.formData.category && this.formData.websites.length) {
                        return true;
                    }

                    this.formErrors = [];
                    !this.formData.gender ? this.formErrors.push('Gender required') : ''
                    !this.formData.category ? this.formErrors.push('Category required') : ''
                    !this.formData.websites.length ? this.formErrors.push('At least one website is required') : ''
                }
            }
        })
    } else if (document.getElementById('body').className == 'clothes index') {
        new Vue({
            el: '#clothes-app',
            data: {
                clothes: [],
                loadingClothes: false,
                page: 0,
                lazyLoad: null,
                category: Cookies.get('category'),
                websites: Cookies.get('websites'),
                scrollDebounceWaitTime: 150,
                bottomOfPageIntersectionReduction: 750
            },
            mounted() {
                this.lazyLoad = new LazyLoad({elements_selector: ".lazy"})
            },
            created() {
                this.getClothes()
                window.addEventListener('scroll', _.debounce(this.isBottomOfPage, this.scrollDebounceWaitTime))
            },
            methods: {
                isBottomOfPage() {
                    if (
                        ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - this.bottomOfPageIntersectionReduction)
                        && !this.loadingClothes
                    ) {
                        this.getClothes()
                    }
                },
                favouriteClick(link) {
                    var cookies = Cookies.getJSON('favourites')
                    _.indexOf(cookies, link) === -1
                        ? this.addFavourite(link, cookies)
                        : this.removeFavourite(link, cookies)
                },
                addFavourite(link, cookies) {
                    !cookies ? cookies = [] : ''
                    Cookies.set('favourites', cookies.concat(link), {expires: 365})
                },
                removeFavourite(link, cookies) {
                    _.pull(cookies, link)
                    Cookies.set('favourites', cookies, {expires: 365})
                },
                getClothes() {
                    this.page += 1
                    this.loadingClothes = true
                    let request = new Request(
                        '/clothes/get_clothes',
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                'page': this.page,
                                'category': this.category,
                                'websites': this.websites
                            }),
                            headers: new Headers({
                                'Content-Type': 'application/json'
                            })
                        }
                    )
                    fetch(request)
                    .then((res) => res.json())
                    .then((json) => {
                        this.loadingClothes = false
                        this.setClothes(json.clothes)
                    })
                },
                setClothes(clothes) {
                    this.clothes = this.clothes.concat(clothes)
                    Vue.nextTick(() => this.lazyLoad.update())
                }
            }
        })
    }
})
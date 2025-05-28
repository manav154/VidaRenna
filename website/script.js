document.addEventListener('DOMContentLoaded', () => {
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('ul.primary-navigation'); // Target the UL

    // --- Mobile Navigation Toggle Button ---
    if (mobileNavToggle && primaryNav) {
        mobileNavToggle.addEventListener('click', () => {
            const isVisible = primaryNav.classList.contains('mobile-menu-open');
            primaryNav.classList.toggle('mobile-menu-open');
            mobileNavToggle.setAttribute('aria-expanded', String(!isVisible));

            if (!isVisible) { // Menu is now open
                document.body.style.overflow = 'hidden'; // Prevent body scroll
            } else { // Menu is now closed
                document.body.style.overflow = ''; // Restore body scroll
            }
        });
    }

    // --- Navigation Link Click Handling (Smooth Scroll and Menu Close) ---
    if (primaryNav) {
        primaryNav.querySelectorAll('a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html');
                let isSamePageAnchor = false;

                if (href) {
                    if (href.startsWith('#')) { // e.g., "#about"
                        isSamePageAnchor = isIndexPage || (window.location.pathname.includes('questionnaire.html') && href === '#questionnaire');
                    } else if (href.includes('index.html#')) { // e.g., "index.html#about"
                        isSamePageAnchor = isIndexPage;
                    }
                }

                // If mobile menu is open, always close it first
                if (primaryNav.classList.contains('mobile-menu-open')) {
                    primaryNav.classList.remove('mobile-menu-open');
                    if (mobileNavToggle) mobileNavToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }

                // Handle same-page anchor scrolling
                if (isSamePageAnchor && href.includes('#')) {
                    e.preventDefault();
                    const targetId = href.substring(href.lastIndexOf('#')); // Get the #hash part
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }

                // Active class styling (primarily for same-page nav on index.html)
                if (isIndexPage && href && href.startsWith('#')) {
                     document.querySelectorAll('nav ul.primary-navigation a').forEach(link => {
                        link.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            });
        });
    }

    // --- Questionnaire Logic ---
    const questionnaireForm = document.getElementById('conflictQuestionnaire');
    const questionSlides = document.querySelectorAll('.question-slide');
    const submitButton = document.getElementById('submitQuestionnaireButton');
    const questionnaireMessage = document.getElementById('questionnaireMessage');
    const progressBarFill = document.querySelector('.progress-bar-fill');
    const progressText = document.querySelector('.progress-text');

    // Total number of questions in the questionnaire (for progress bar estimation)
    const totalQuestions = questionSlides.length; // This is 12 based on your HTML
    let currentInternalQuestionIndex = 0; // Tracks the internal data-question-index of the active slide

    // Define messages and referrals
    const messages = {
        endChatOkay: "That's okay. If things ever change, or you need someone to talk to, we're here.",
        immediateDanger: "Please call 911 or the Suicide Crisis helpline 988. You are not alone.",
        youthServices: "You may qualify for Youth Adult specific housing + support services. Connect to Youth Services: Covenant House, Horizons for Youth.",
        suicideHelp: "Please contact 988 or text TALK to 686868. There is always someone ready to help",
        substanceUse: "Refer to substance use + harm reduction line. CAMH.",
        relationshipStress: "There are people you can talk to about this with no pressure or judgement. Refer to Assoumed Women's Helpline.",
        sexualHealth: "Refer to sexual health/teen pregnancy support line.",
        schoolStress: "A lot of people are feeling that way - you're not alone. Refer to stress/youth councilling.",
        thanksForCheckingIn: "Thanks for checking in and know you can come back anytime if things change.",
        notSureChange: "That's okay if things change, we're here."
    };

    function updateProgressBar(internalIndex) {
        if (!progressBarFill || !progressText) return;

        // Progress based on the static internal index (0-indexed) + 1 for display
        // The text content now just indicates "Progress" or can be adjusted further if desired
        const progressPercentage = ((internalIndex + 1) / totalQuestions) * 100;
        progressBarFill.style.width = `${progressPercentage}%`;
        // We removed specific numbering, so the text can be generic progress or removed
        // progressText.textContent = `Progress`; // Or, if you want "X% complete": `${Math.round(progressPercentage)}% Complete`;
        // Keeping it simple as "Progress" as per the span in HTML
    }

    function showQuestion(internalIndex) {
        questionSlides.forEach((slide, i) => {
            if (i === internalIndex) {
                slide.style.display = 'block';
                void slide.offsetWidth; // Trigger reflow for transition
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
                slide.style.display = 'none';
            }
        });
        currentInternalQuestionIndex = internalIndex; // Update the internal index
        updateProgressBar(currentInternalQuestionIndex);
        questionnaireMessage.style.display = 'none'; // Hide any previous messages
        submitButton.style.display = 'none'; // Ensure submit button is hidden unless explicitly shown
    }

    function displayOutcome(message) {
        questionSlides.forEach(slide => slide.style.display = 'none'); // Hide all questions
        submitButton.style.display = 'none'; // Ensure submit button is hidden
        progressBarFill.style.width = '100%'; // Mark as complete or final
        progressText.textContent = 'Completed'; // Update text for completion
        questionnaireMessage.textContent = message;
        questionnaireMessage.style.color = '#3B82F6'; // Or specific colors for different outcomes
        questionnaireMessage.style.display = 'block';
        questionnaireMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    if (questionnaireForm) {
        // Attach change listeners to all radio buttons for dynamic flow
        questionnaireForm.addEventListener('change', function(event) {
            if (event.target.type === 'radio') {
                const questionName = event.target.name;
                const answer = event.target.value;

                // Decision tree logic based on the tree PDF
                if (questionName === 'q1') { // Q1: Are you (or someone you care about)...
                    if (answer === 'yes') {
                        showQuestion(1); // Go to internal index 1 (Q2)
                    } else { // No
                        displayOutcome(messages.endChatOkay);
                    }
                } else if (questionName === 'q2') { // Q2: Is the situation putting you...immediate danger?
                    if (answer === 'yes') {
                        displayOutcome(messages.immediateDanger);
                    } else { // No
                        showQuestion(2); // Go to internal index 2 (Q3)
                    }
                } else if (questionName === 'q3') { // Q3: Is this situation affecting how safe, stable, or supported...
                    if (answer === 'yes') {
                        showQuestion(3); // Go to internal index 3 (Q4)
                    } else { // No
                        showQuestion(11); // Go to internal index 11 (Q12 "It's okay if you're not sure...")
                    }
                } else if (questionName === 'q4') { // Q4: Are you worried about losing your housing...
                    if (answer === 'yes') {
                        showQuestion(4); // Go to internal index 4 (Q5)
                    } else { // No
                        showQuestion(5); // Go to internal index 5 (Q6)
                    }
                } else if (questionName === 'q5') { // Q5: Are you <25 years of age?
                    if (answer === 'yes') {
                        displayOutcome(messages.youthServices);
                    } else { // No
                        showQuestion(5); // Go to internal index 5 (Q6)
                    }
                } else if (questionName === 'q6') { // Q6: Even if you're still at home, is the situation starting to affect your mental health...
                    if (answer === 'yes') {
                        showQuestion(6); // Go to internal index 6 (Q7)
                    } else { // No
                        showQuestion(7); // Go to internal index 7 (Q8)
                    }
                } else if (questionName === 'q7') { // Q7: Are you having thoughts of hurting yourself or feeling hopeless?
                    if (answer === 'yes') {
                        displayOutcome(messages.suicideHelp);
                    } else { // No
                        showQuestion(7); // Go to internal index 7 (Q8)
                    }
                } else if (questionName === 'q8') { // Q8: Are you or someone close to you dealing with substance use...
                    if (answer === 'yes') {
                        displayOutcome(messages.substanceUse);
                    } else { // No
                        showQuestion(8); // Go to internal index 8 (Q9)
                    }
                } else if (questionName === 'q9') { // Q9: Is something in a relationship...
                    if (answer === 'yes') {
                        displayOutcome(messages.relationshipStress);
                    } else { // No
                        showQuestion(9); // Go to internal index 9 (Q10)
                    }
                } else if (questionName === 'q10') { // Q10: Are you feeling overwhelmed by something related to pregnancy...
                    if (answer === 'yes') {
                        displayOutcome(messages.sexualHealth);
                    } else { // No
                        showQuestion(10); // Go to internal index 10 (Q11)
                    }
                } else if (questionName === 'q11') { // Q11: Are School, grades, or pressure from home starting to pile up...
                    if (answer === 'yes') {
                        displayOutcome(messages.schoolStress);
                    } else { // No
                        displayOutcome(messages.thanksForCheckingIn);
                    }
                } else if (questionName === 'q12') { // Q12: It's okay if you're not sure. Would you like to check in on other areas...
                    if (answer === 'yes') {
                        showQuestion(5); // Go to internal index 5 (Q6)
                    } else { // No
                        displayOutcome(messages.notSureChange);
                    }
                }
            }
        });

        // The submit button is largely deprecated by the tree's direct outcomes.
        // It's kept hidden and its original functionality is removed.
        questionnaireForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Form submission attempted, but questionnaire logic handles outcomes directly.");
        });

        // Initialize the questionnaire by showing the first question
        if (questionSlides.length > 0) {
            showQuestion(0); // Show the first internal question (Q1)
        }
    }

// --- Contact Form Logic ---
    const contactForm = document.getElementById('mediatorContactForm');
    const contactMessage = document.getElementById('contactMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Prevent default submission initially to handle display
            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            if (contactMessage) {
                contactMessage.textContent = "Submitting your message...";
                contactMessage.style.color = '#3B82F6';
                contactMessage.style.display = 'block';
            }

            try {
                // Submit the form using Fetch API to Formspree
                // This makes it an AJAX submission, preventing a full page reload
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData, // Formspree handles formData directly without JSON.stringify
                    headers: {
                        'Accept': 'application/json' // Tell Formspree you expect a JSON response
                    }
                });

                const result = await response.json(); // Get the JSON response from Formspree

                if (response.ok) { // Check if the response status is 2xx (success)
                    if (contactMessage) {
                        contactMessage.textContent = "Thank you for your message! We will get back to you shortly.";
                        contactMessage.style.color = '#3B82F6';
                    }
                    contactForm.reset(); // Clear the form fields
                } else {
                    // Formspree returns errors in the 'errors' array if submission fails
                    const errorMessage = result.errors && result.errors.length > 0 ? result.errors[0].message : "Please try again.";
                    if (contactMessage) {
                        contactMessage.textContent = `There was an error: ${errorMessage}`;
                        contactMessage.style.color = 'red';
                    }
                }
            } catch (error) {
                console.error('Submission error:', error);
                if (contactMessage) {
                    contactMessage.textContent = "Network error or problem submitting form. Please try again later.";
                    contactMessage.style.color = 'red';
                }
            }
        });
    }
});
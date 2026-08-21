/*!
* Start Bootstrap - Agency v7.0.12
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT
*/
//
// Scripts
//

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');

        if (!navbarCollapsible) {
            return;
        }

        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink');
        } else {
            navbarCollapsible.classList.add('navbar-shrink');
        }
    };

    // Shrink the navbar
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    // Activate Bootstrap scrollspy
    const mainNav = document.body.querySelector('#mainNav');

    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    }

    // Collapse responsive navbar
    const navbarToggler =
        document.body.querySelector('.navbar-toggler');

    const responsiveNavItems =
        [].slice.call(
            document.querySelectorAll(
                '#navbarResponsive .nav-link'
            )
        );

    responsiveNavItems.map(function (responsiveNavItem) {

        responsiveNavItem.addEventListener('click', () => {

            if (
                navbarToggler &&
                window.getComputedStyle(navbarToggler).display !== 'none'
            ) {
                navbarToggler.click();
            }

        });

    });


    // ============================================================
    // DEBATE RESULTS
    // ============================================================

    if (
        window.location.pathname.includes("results.html")
    ) {

        const result =
            JSON.parse(
                localStorage.getItem("debate_result")
            );

        if (!result) {

            alert("No debate result found.");

            window.location.href =
                "debate.html";

            return;
        }


        // Basic debate result
        const scoreElement =
            document.getElementById("score");

        const topicElement =
            document.getElementById("topic");

        const fallacyElement =
            document.getElementById("fallacy");

        const counterElement =
            document.getElementById("counter");

        const suggestionElement =
            document.getElementById("suggestion");


        if (scoreElement) {
            scoreElement.textContent =
                "Overall Score: " +
                result.score +
                "/100";
        }

        if (topicElement) {
            topicElement.textContent =
                result.topic || "";
        }

        if (fallacyElement) {
            fallacyElement.textContent =
                result.logical_fallacy ||
                "None Detected";
        }

        if (counterElement) {
            counterElement.textContent =
                result.counter_argument || "";
        }

        if (suggestionElement) {
            suggestionElement.textContent =
                result.suggestion || "";
        }


        // ========================================================
        // PERSONALIZED COACHING
        // ========================================================

        const token =
            localStorage.getItem("token");

        if (!token) {
            return;
        }


        fetch(
            "http://127.0.0.1:8000/coaching/recommendations",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization":
                        "Bearer " + token
                },

                body: JSON.stringify({

                    topic: result.topic,

                    argument: result.argument,

                    score: result.score,

                    logical_fallacy:
                        result.logical_fallacy ||
                        "None Detected"

                })
            }
        )

        .then(response => response.json())

        .then(coaching => {

            if (!coaching) {
                return;
            }


            // Strengths
            const strengths =
                document.getElementById("strengths");

            if (strengths) {

                strengths.innerHTML = "";

                (coaching.strengths || [])
                    .forEach(item => {

                        const li =
                            document.createElement("li");

                        li.textContent = item;

                        strengths.appendChild(li);

                    });
            }


            // Recommendations
            const recommendations =
                document.getElementById(
                    "recommendations"
                );

            if (recommendations) {

                recommendations.innerHTML = "";

                (coaching.recommendations || [])
                    .forEach(item => {

                        const li =
                            document.createElement("li");

                        li.textContent = item;

                        recommendations.appendChild(li);

                    });
            }


            // Exercises
            const exercises =
                document.getElementById("exercises");

            if (exercises) {

                exercises.innerHTML = "";

                (coaching.recommended_exercises || [])
                    .forEach(item => {

                        const li =
                            document.createElement("li");

                        li.textContent = item;

                        exercises.appendChild(li);

                    });
            }


            // Learning Path
            const learningPath =
                document.getElementById(
                    "learningPath"
                );

            if (learningPath) {

                learningPath.innerHTML = "";

                (coaching.learning_path || [])
                    .forEach(item => {

                        const li =
                            document.createElement("li");

                        li.textContent = item;

                        learningPath.appendChild(li);

                    });
            }

        })

        .catch(error => {

            console.error(
                "Coaching error:",
                error
            );

        });

    }

});
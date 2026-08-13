(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".primary-nav");
  const themeToggle = document.querySelector(".theme-toggle");
  const filterButtons = document.querySelectorAll(".filter-button");
  const taskCards = document.querySelectorAll(".task-card");
  const form = document.querySelector(".contact-form");

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const savedTheme = localStorage.getItem("training-dashboard-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        "training-dashboard-theme",
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;

      taskCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.classList.toggle("hidden", !show);
      });
    });
  });

  if (form) {
    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const updateInput = form.querySelector("#update");
    const successMessage = form.querySelector(".form-success");

    const setError = (input, message) => {
      input.classList.add("invalid");
      const error = input.parentElement.querySelector(".error");
      if (error) error.textContent = message;
    };

    const clearError = (input) => {
      input.classList.remove("invalid");
      const error = input.parentElement.querySelector(".error");
      if (error) error.textContent = "";
    };

    [nameInput, emailInput, updateInput].forEach((input) => {
      input.addEventListener("input", () => clearError(input));
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      successMessage.textContent = "";

      [nameInput, emailInput, updateInput].forEach(clearError);

      if (nameInput.value.trim().length < 2) {
        setError(nameInput, "Please enter at least 2 characters.");
        valid = false;
      }

      if (!emailInput.validity.valid || !emailInput.value.trim()) {
        setError(emailInput, "Please enter a valid email address.");
        valid = false;
      }

      if (updateInput.value.trim().length < 20) {
        setError(updateInput, "Project update must contain at least 20 characters.");
        valid = false;
      }

      if (valid) {
        successMessage.textContent =
          "Validation successful. This demonstration form does not send data to a server.";
        form.reset();
      }
    });
  }
})();

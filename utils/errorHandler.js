// Minimal Error Handling System for Bindedating

// Lightweight ErrorHandler
const ErrorHandler = {
    handleError: function (error, elementId = null) {
      console.error("[ErrorHandler]", error);
      const message = error.message || "Something went wrong.";
      this.displayMessage(message, elementId);
    },
  
    displayMessage: function (message, elementId) {
      // Display inline if element provided
      if (elementId) {
        const target = document.getElementById(elementId);
        if (target) {
          let msg = document.createElement("div");
          msg.className = "error-message";
          msg.textContent = message;
          target.parentNode.insertBefore(msg, target.nextSibling);
          return;
        }
      }
  
      // Else, simple alert fallback
      alert(message);
    },
  
    clearErrors: function (formId) {
      const form = document.getElementById(formId);
      if (!form) return;
      const errorEls = form.querySelectorAll(".error-message");
      errorEls.forEach(el => el.remove());
    }
  };
  
  // FormValidator
  const FormValidator = {
    validateForm: function (formId, rules) {
      const form = document.getElementById(formId);
      if (!form) return false;
      ErrorHandler.clearErrors(formId);
      let isValid = true;
  
      for (const fieldId in rules) {
        const field = form.querySelector(`#${fieldId}`);
        if (!field) continue;
        const value = field.value.trim();
        const r = rules[fieldId];
  
        if (r.required && !value) {
          ErrorHandler.handleError({ message: r.required }, fieldId);
          isValid = false;
          continue;
        }
  
        if (r.minLength && value.length < r.minLength) {
          ErrorHandler.handleError({ message: `Min ${r.minLength} characters` }, fieldId);
          isValid = false;
          continue;
        }
  
        if (r.pattern && !r.pattern.test(value)) {
          ErrorHandler.handleError({ message: r.message || "Invalid format" }, fieldId);
          isValid = false;
          continue;
        }
  
        if (r.match) {
          const matchField = form.querySelector(`#${r.match}`);
          if (matchField && matchField.value.trim() !== value) {
            ErrorHandler.handleError({ message: r.matchMessage || "Fields do not match" }, fieldId);
            isValid = false;
          }
        }
      }
  
      return isValid;
    }
  };
  
  // Lightweight API Handler
  const ApiHandler = {
    fetchWithHandling: async function (url, options = {}, elementId = null) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw { message: `Error ${response.status}` };
        return await response.json();
      } catch (error) {
        ErrorHandler.handleError(error, elementId);
        return null;
      }
    }
  };
  
  // Attach errorHandler to window for global use
  window.ErrorHandler = ErrorHandler;
  window.FormValidator = FormValidator;
  window.ApiHandler = ApiHandler;
  
const display = document.querySelector(".display");
const buttons = document.querySelectorAll(".buttons button");

const operators = ["+", "-", "×", "÷"];

// Helper function to get the current number being typed (after the last operator)
function getCurrentNumber() {
    const value = display.textContent;
    const parts = value.split(/[+\-×÷]/);
    return parts[parts.length - 1];
}

// Helper to evaluate the math expression
function calculateResult() {
    let expression = display.textContent.trim();

    if (!expression || expression === "Error") return;

    // Remove any trailing operator before evaluating
    while (operators.includes(expression.slice(-1))) {
        expression = expression.slice(0, -1);
    }

    if (!expression) return;

    // Convert display operators to JavaScript operators
    const sanitizedExpression = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/");

    try {
        // Safe evaluation of basic mathematical expressions
        // Only allow digits, operators, parentheses, and decimals
        if (!/^[0-9+\-*/.() ]+$/.test(sanitizedExpression)) {
            display.textContent = "Error";
            return;
        }

        const result = Function(`"use strict"; return (${sanitizedExpression})`)();

        if (result === Infinity || result === -Infinity || isNaN(result)) {
            display.textContent = "Error";
        } else {
            // Round to prevent long floating point inaccuracies (e.g. 0.1 + 0.2)
            display.textContent = parseFloat(result.toFixed(10)).toString();
        }
    } catch (error) {
        display.textContent = "Error";
    }
}

// Handle all button clicks
buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
        const text = btn.textContent.trim();
        handleInput(text);
    });
});

// Central input handler for both clicks and keyboard
function handleInput(value) {
    const current = display.textContent;

    // If there was an error, clear on next input
    if (current === "Error") {
        display.textContent = "";
    }

    // 1. All Clear (AC)
    if (value === "AC") {
        display.textContent = "";
        return;
    }

    // 2. Delete last character (DEL)
    if (value === "DEL") {
        display.textContent = display.textContent.slice(0, -1);
        return;
    }

    // 3. Equals (=)
    if (value === "=") {
        calculateResult();
        return;
    }

    // 4. Operators (+, -, ×, ÷)
    if (operators.includes(value)) {
        if (display.textContent === "") {
            // Allow negative numbers at the start
            if (value === "-") {
                display.textContent = "-";
            }
            return;
        }

        const lastChar = display.textContent.slice(-1);

        // If the last character is an operator, replace it with the new operator
        if (operators.includes(lastChar)) {
            display.textContent = display.textContent.slice(0, -1) + value;
        } else {
            display.textContent += value;
        }
        return;
    }

    // 5. Decimal point (.)
    if (value === ".") {
        const currentNumber = getCurrentNumber();
        // Prevent multiple decimal points in the same number
        if (currentNumber.includes(".")) {
            return;
        }
        // If empty or after an operator, prepend 0
        if (!currentNumber) {
            display.textContent += "0.";
            return;
        }
        display.textContent += ".";
        return;
    }

    // 6. Number keys (0-9)
    display.textContent += value;
}

// Keyboard Support
window.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
        handleInput(e.key);
    } else if (e.key === ".") {
        handleInput(".");
    } else if (e.key === "+") {
        handleInput("+");
    } else if (e.key === "-") {
        handleInput("-");
    } else if (e.key === "*") {
        handleInput("×");
    } else if (e.key === "/") {
        e.preventDefault(); // Prevent browser shortcut search
        handleInput("÷");
    } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleInput("=");
    } else if (e.key === "Backspace") {
        handleInput("DEL");
    } else if (e.key === "Escape" || e.key.toLowerCase() === "c") {
        handleInput("AC");
    }
});

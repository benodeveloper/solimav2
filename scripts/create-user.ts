import { AuthService } from '../src/services/auth.service';
import { input, password as passwordInput } from "@inquirer/prompts";

async function promptValidname(): Promise<string> {
  while (true) {
    const inputValue = await input({
      message: "Please insert the Full Name: ",
    });
    const username = inputValue.trim();

    const errors: string[] = [];

    if (!username.length) {
      errors.push("Full Name is required!");
    }

    if (username.length > 80) {
      errors.push("Full Name must be less than 80 characters.");
    }

    if (!errors.length) {
      return username;
    }

    errors.forEach((err) => console.error(err));
    console.log();
  }
}

async function promptValidEmail(): Promise<string> {
  while (true) {
    const inputValue = await input({ message: "Please insert the Email: " });
    const email = inputValue.trim().toLowerCase();

    const errors: string[] = [];

    if (!email.length) {
      errors.push("Email is required!");
    }

    if (email.length > 255) {
      errors.push("Email must be less than 255 characters.");
    }

    if (email.length && !isValidEmail(email)) {
      errors.push("Invalid email format.");
    }

    if (email.length) {
      const existing = await AuthService.getUserByEmail(email);

      if (existing) {
        errors.push("Email is already used!");
      }
    }

    if (!errors.length) {
      return email;
    }

    errors.forEach((err) => console.error(err));
    console.log();
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function promptValidPassword(): Promise<string> {
  while (true) {
    const password = await passwordInput({
      message: "Please insert the Password: ",
    });
    const confirm = await passwordInput({
      message: "Please confirm the Password: ",
    });

    const errors: string[] = [];

    if (!password.length) {
      errors.push("Password is required.");
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters.");
    }

    if (password.length > 255) {
      errors.push("Password is too long.");
    }

    if (password !== confirm) {
      errors.push("Passwords do not match.");
    }

    if (!errors.length) {
      return password;
    }

    errors.forEach((err) => console.error(err));
    console.log();
  }
}

async function main() {
  try {
    console.log("Creating a new user...");
    console.log("Please fill out the user information.\n");

    const name = await promptValidname();
    const email = await promptValidEmail();
    const password = await promptValidPassword();

    await AuthService.createUser({
      name, email, password
    })
    console.log("New user created successfully.");

  } catch (error) {
    console.error("Unexpected error while creating user.");
    console.error(String(error));
  } finally {
    process.exit(0);
  }
}

main();

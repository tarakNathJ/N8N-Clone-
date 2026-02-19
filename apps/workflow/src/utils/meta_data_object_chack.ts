import type {
  gmail,
  telegram,
  receive_email,
  scheduler,
  form,
  webhook,
} from "../types/index.js";

class type_chack_for_steps_metadata {
  is_gmail(obj: gmail): boolean {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "email" in obj &&
      "app_password" in obj &&
      "message" in obj &&
      typeof obj.email === "string" &&
      typeof obj.app_password === "string" &&
      typeof obj.message === "string"
    ) {
      return true;
    } else {
      return false;
    }
  }

  is_telegram(obj: telegram): boolean {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "chatId" in obj &&
      "token" in obj &&
      typeof obj.token === "string" &&
      typeof obj.chatId === "string"
    ) {
      console.log("true");
      return true;
    } else {
      console.log("false");
      return false;
    }
  }

  is_recerve_email(obj: receive_email): boolean {
    
    if (
      typeof obj === "object" &&
      obj !== null &&
      "secret" in obj &&
      "url" in obj &&
      typeof obj.secret === "string" &&
      typeof obj.url === "string"
    ) {
      return true;
    } else {
      return false;
    }
  }

  is_scheduler(obj: scheduler): boolean {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "email" in obj &&
      "app_password" in obj &&
      "time" in obj &&
      typeof obj.email === "string" &&
      typeof obj.app_password === "string" &&
      typeof obj.time === "string"
    ) {
      return true;
    } else {
      return false;
    }
  }

  //   chack from all field
  private is_form_field_chacker(obj: form): obj is form {
    return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.field_name === "string" &&
      typeof obj.element_type === "string" &&
      typeof obj.placeholder === "string"
    );
  }


  is_from(obj: object): boolean {
    // chack this  object are not null
    if (typeof obj !== "object" || obj === null) {
      return false;
    }

    if (!("email" in obj) || typeof (obj as any).email !== "string") {
      return false;
    }

    if (!("fields" in obj) || !Array.isArray((obj as any).fields)) {
      return false;
    }
    return true;
  }

  // webhook
  is_webhook(obj: webhook): boolean {
    console.log(obj);
    // chack this  object are not null
    if (
      typeof obj === "object" &&
      obj !== null &&
      "METHOD" in obj &&
      typeof obj.METHOD === "string"
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export { type_chack_for_steps_metadata };

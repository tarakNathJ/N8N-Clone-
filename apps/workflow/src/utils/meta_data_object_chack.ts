import type {
  gmail,
  telegram,
  recerve_email,
  scheduler,
  form,
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
      return true;
    } else {
      return false;
    }
  }

  is_recerve_email(obj: recerve_email): boolean {
    if (
      typeof obj === "object" &&
      obj !== null &&
      "email" in obj &&
      "app_password" in obj &&
      typeof obj.email === "string" &&
      typeof obj.app_password === "string"
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
  private  is_form_field_chacker(obj: form): obj is form {
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

    let field :form
    // @ts-ignore
    for ( field in obj) {
        if(!this.is_form_field_chacker(field)){
            return false
        }
    }


    return true
  }
}


export {type_chack_for_steps_metadata};
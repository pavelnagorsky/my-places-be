import { join, resolve } from 'path';
import { ISendMailOptions } from '@nestjs-modules/mailer';

export const MAIL_TEMPLATES_PATH = join(process.cwd(), 'public/templates/');

// a helper function which generates the full path to the mail template
export const getFullTemplatePath = (templatePath: string): string => {
  return resolve(MAIL_TEMPLATES_PATH, ...templatePath.split('/'));
};

export abstract class AbstractEmail implements ISendMailOptions {
  constructor(templateMode: boolean, data: string) {
    if (templateMode) {
      this.template = getFullTemplatePath(data);
    } else {
      this.html = data;
    }
  }

  public readonly template: string;

  // list of emails
  public to: string[] | string;

  // template data payload
  public context: object;

  // html instead of template
  public html: string;

  // default sender
  public from = 'Знай свой край <no-reply@my-places.by>';

  protected readonly supportSender = 'Знай свой край <support@my-places.by>';

  // Subject line
  public abstract subject: string;
}

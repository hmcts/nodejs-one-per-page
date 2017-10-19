const { Question, goTo } = require('@hmcts/one-per-page');
const { form, textField } = require('@hmcts/one-per-page/forms');
const Joi = require('joi');

class RespondentTitle extends Question {
  get url() {
    return '/who-are-you-divorcing';
  }

  get form() {
    return form(
      textField('husbandOrWife').joi(
        'Select who you are divorcing',
        Joi.string().required()
          .valid(['wife', 'husband'])
      )
    );
  }

  next() {
    return goTo(this.journey.RespondentName);
  }
}

module.exports = RespondentTitle;

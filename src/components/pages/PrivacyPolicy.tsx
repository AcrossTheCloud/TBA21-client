import * as React from 'react';
import { connect } from 'react-redux';
import { PrivacyPolicyState } from 'reducers/pages/privacyPolicy';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

interface Props extends PrivacyPolicyState  {
  modalToggle: Function;
}

class PrivacyPolicy extends React.Component<Props, {}> {
  render() {
    return (
      <Modal isOpen={this.props.open} toggle={() => this.props.modalToggle('PP_MODAL')} className="fullwidth">
        <ModalHeader toggle={() => this.props.modalToggle('PP_MODAL')}>PRIVACY POLICY</ModalHeader>
        <ModalBody>
          <h1>PRIVACY POLICY</h1>

          <h2>1. Definitions</h2>

          <p>For the purposes of this Privacy Policy:</p>

          <p>‘personal data’ means any information relating to an identified or identifiable natural person (hereinafter ‘you’); an identifiable natural person is one who can be identified, directly or indirectly, in particular by reference to an identifier such as a name, an identification number, location data, an online identifier or to one or more factors specific to the physical, physiological, genetic, mental, economic, cultural or social identity of that natural person.</p>

          <p>‘processing’ means any operation or set of operations which is performed on personal data or on sets of personal data, whether or not by automated means, such as collection, recording, organization, structuring, storage, adaptation or alteration, retrieval, consultation, use, disclosure by transmission, dissemination or otherwise making available, alignment or combination, restriction, erasure or destruction.</p>

          <p>‘restriction of processing’ means the marking of stored personal data with the aim of limiting their processing in the future.</p>

          <p>‘profiling’ means any form of automated processing of personal data consisting of the use of personal data to evaluate certain personal aspects relating to a natural person, in particular to analyse or predict aspects concerning that natural person’s performance at work, economic situation, health, personal preferences, interests, reliability, behaviour, location or movements.</p>

          <p>‘controller’ means the natural or legal person, public authority, agency or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data; where the purposes and means of such processing are determined by Union or Member State law, the controller or the specific criteria for its nomination may be provided for by Union or Member State law.</p>

          <p>‘recipient’ means a natural or legal person, public authority, agency or another body, to which the personal data are disclosed, whether a third party or not. However, public authorities which may receive personal data in the framework of a particular inquiry in accordance with Union or Member State law shall not be regarded as recipients; the processing of those data by those public authorities shall be in compliance with the applicable data protection rules according to the purposes of the processing.</p>

          <p>‘third party’ means a natural or legal person, public authority, agency or body other than you and other identified or identifiable natural person, controller, processor and persons who, under the direct authority of the controller or processor, are authorized to process personal data.</p>

          <p>‘consent’ means any freely given, specific, informed and unambiguous indication of your wishes by which you, by a statement or by a clear affirmative action, signifies agreement to the processing of personal data relating to you.</p>

          <p>‘supervisory authority’ means an independent public authority which is established by a Member State pursuant to Art. 51 GDPR. ‘international organization’ means an organization and its subordinate bodies governed by public international law, or any other body which is set up by, or on the basis of, an agreement between two or more countries.</p>

          <h2>2. Name and Address of the Controller</h2>

          <p>The controller within the meaning of the General Data Protection Regulation and other national data protection laws of the member states as well as other data protection regulations is:</p>

          <p>
            Thyssen-Bornemisza Art Contemporary Privatstiftung<br/>
            Köstlergasse 1<br/>
            1060 Vienna, Austria<br/>
            P: +43 1 513 98 56-0<br/>
            E: <a href="mailto:legal@tba21-academy.org">legal@tba21-academy.org</a><br/>
            W: <a href="www.tba21-academy.org" target="_blank" rel="noreferrer noopener">www.TBA21-Academy.org</a><br/>
          </p>

          <h2>3. General Information</h2>

          <p>In principle, we process personal data only as necessary to provide a functioning website, as well as our content and services. We regularly only process personal data with the consent of the users. An exception applies to cases in which prior consent can not be obtained for factual reasons and the processing of the data is permitted by law.</p>

          <p>To the extent we obtain consent to process personal data, Art. 6 (1) lit. a) EU General Data Protection Regulation (GDPR) serves as the legal basis.</p>

          <p>In case the processing of personal data is necessary for the performance of a contract to which you are a party, Art. 6 (1) lit. b) GDPR serves as the legal basis. This also applies to processing operations required to carry out pre-contractual actions.</p>

          <p>To the extent the processing of personal data is required to fulfil a legal obligation that is subject to our company, Art. 6 (1) lit. c) GDPR serves as the legal basis.</p>

          <p>In the event that vital interests of you or another natural person require the processing of personal data, Art. 6 (1) lit. d) GDPR serves as the legal basis.</p>

          <p>If processing is necessary to safeguard the legitimate interests of our company or a third party, and if your interests, fundamental rights and freedoms do not prevail over the first interest, Art. 6 (1) lit. f) GDPR serves as the legal basis for the processing.</p>

          <p>The personal data of the concerned person will be deleted or blocked as soon as the purpose of the storage is omitted. In addition, such storage may be provided for by the European or national legislator in EU regulations, laws or other regulations to which the controller is subject. A blocking or deletion of the data takes place, if the mandatory storage period expires, unless there is a need for further storage of the data for a contract conclusion or a contract fulfilment.</p>

          <h2>4. Provision of the Website and Creation of Log Files</h2>

          <p>Each time our website is accessed, our system automatically collects data and information from the computer system of the calling computer. The following data is collected:</p>

          <p>
            a) Your browser type and version <br />
            b) Your operating system <br />
            c) Your internet service provider <br />
            d) Your IP address <br />
            e) Date and time of access <br />
            f) Websites from which your system comes to our website <br />
            g) Websites you accessed through our website <br />
          </p>

          <p>The data is also stored in the log files of our system. A storage of this data together with your other personal data does not take place.</p>

          <p>The legal basis for the temporary storage of data and log files is Art. 6 (1) lit. f) GDPR.</p>

          <p>The temporary storage of the IP address by the system is necessary to allow provision of the website to your computer. To do this, your IP address must be kept for the duration of the session.</p>

          <p>Storage in log files is done to ensure the functionality of the website. In addition, the data is used to optimize the website and to ensure the security of our information technology systems. An evaluation of the data for marketing purposes does not take place in this context.</p>

          <p>For these purposes, we have a legitimate interest in the processing of data pursuant to Art. 6 (1) lit. f) GDPR.</p>

          <p>The data will be deleted as soon as it is no longer necessary for the purposes stated above. In the event of collecting data to provide the website, this is the case when the respective session is completed.</p>

          <p>In the event of storing the data in log files, this is the case after no more than seven days. An additional storage is possible. In this case, your IP addresses are deleted or alienated, so that an assignment of the calling client is no longer possible.</p>

          <p>The collection of data for the provision of the website and the storage of the data in log files is essential for the operation of the website. Consequently, there is no contradiction possible on your part.</p>

          <h2>5. Cookies</h2>

          <p>We use cookies on our site. A cookie is a small file that your browser automatically creates and that is stored on your device (laptop, tablet, smartphone, etc.). You can use your web browser’s settings to refuse cookies if you wish.</p>

          <p>When you visit our website, the following categories of cookies may be stored:</p>

          <h3>5.1 Strictly necessary cookies and session tokens</h3>
          <p>These cookies enable you to move around a site and use its features. Without these cookies, services you have asked for cannot be provided.</p>

          <p>The cookies, which are a technical necessity, are generally deleted when the browser is closed. The session tokens are cleared on logout for users with an account in the system.</p>

          <h3>5.2 Performance cookies</h3>
          <p>These cookies collect information so that we can analyse how our visitors use our site. These cookies do not collect information that identifies you. All information these cookies collect is anonymous and is only used to improve how our site works.</p>

          <h3>5.3 Functional cookies</h3>
          <p>These cookies allow websites and applications to remember choices you make and provide enhanced, more personal features.</p>

          <p>We may use information collected from functional cookies to identify user behaviour and to serve content based on the user profile. These cookies cannot track your browsing activity on other websites. They do not gather any information about you that could be used for advertising or to record where you have been on the Internet outside our site.</p>

          <h3>5.4 Analytics cookies</h3>
          <p>In order to keep our website services relevant, easy to use and up-to-date, we use web analytics services to help us understand how people use the site.</p>

          <p>Cookies allow web analytics services to recognise your browser or device and, for example, identify whether you have visited our website before, what you have previously viewed or clicked on, and how you found us. The information is anonymous and only used for statistical purposes, and it helps us to analyse patterns of user activity and to develop a better user experience.</p>

          <p>Persistent cookies have a lifespan which varies between a few minutes and several years.</p>

          <p>The data processed by cookies are for the purposes mentioned in order to safeguard our legitimate interests as well as third parties pursuant to Art. 6 (1) f) GDPR required.</p>

          <p>Most browsers accept cookies automatically. Should you not wish these cookies to be stored, please deactivate the acceptance of these cookies in your internet browser. However, this may limit the functionality of our website. You can also delete persistent cookies via your browser at any time.</p>

          <h2>6. Analytics and Ads</h2>

          <p>We may use third-party Service Providers to monitor and analyse the use of our service and for advertising purposes.</p>

          <h3>6.1 Google Analytics</h3>
          <p>Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google uses the data collected to track and monitor the use of our Service. This data is shared with other Google services. Google may use the collected data to contextualize and personalize the ads of its own advertising network.</p>

          <p>You can opt-out of having made your activity on the Service available to Google Analytics by installing the Google Analytics opt-out browser add-on. The add-on prevents the Google Analytics JavaScript (ga.js, analytics.js, and dc.js) from sharing information with Google Analytics about visits activity.</p>

          <p>For more information on the privacy practices of Google, please visit the Google Privacy & Terms website: https://policies.google.com/privacy</p>

          <h3>6.2 Google AdSense</h3>
          <p>Google AdSense is a program that allows website publishers to earn money via targeted ads provided by Google and its partners.</p>

          <p>Google AdSense uses cookies to help it display ads that are relevant to your website’s visitors. Because of the information that these particular cookies provide about your visitors, they constitute personal data.</p>

          <p>You can opt out of showing ads that are based on users’ interests, demographics, and Google Account information. In turn, Google will not use visitation information from your site to help infer interests and demographics, and will not add visitation information from your site to users' Google Accounts. However, you cannot opt out of showing ads to users based on their previous interactions with the advertiser, such as visits to an advertiser's website, known as remarketing.</p>

          <p>For more information on the privacy practices of Google, please visit the Google Privacy & Terms website: https://policies.google.com/privacy</p>

          <h2>7. Newsletter and Email Marketing</h2>

          <p>We may provide you with the opportunity to sign-up for a periodic email newsletter by entering in your email address and confirming it by clicking on a confirmation link sent to you by us by email (double opt-in). The legal basis for this processing is Art. 6 (1) lit. a) GDPR.</p>

          <p>In some cases we may ask you for further information, such as name, occupation, address or telephone number. Regarding the processing of this personal data you will be asked to grant your explicit consent. The legal basis for this processing is Art. 6 (1) lit. a) GDPR.</p>

          <p>If you subscribe for our periodic email newsletter your IP address as well as data and time of subscription will be collected and stored by us. This allows us to prevent misuse of our services or your email address. The legal basis for this processing is Art. 6 (1) lit. f) GDPR.</p>

          <p>This data is only used for the distribution of the newsletter. The subscription may be terminated by you at any time by following the unsubscribe instructions included in each newsletter. We will delete the relevant personal data promptly upon your unsubscribe instruction.</p>

          <p>In addition, we may use the following third-party service providers named below to process and store your data:</p>

          <p>Mailchimp: We use Mailchimp to manage email marketing subscriber lists and send emails to our subscribers. Read their privacy policy at https://mailchimp.com/legal/privacy/</p>

          <p>We will not share your personal information with any other third-party unless we have your permission or the law requires us to.</p>

          <h2>8. Contact Form and Email Contact</h2>

          <p>There is a contact form available on our website, which can be used for electronic contact. If you use this option, the data entered in the input mask will be transmitted to us and saved. This includes:
            a) Name <br />
            b) Email
          </p>

          <p>At the time of transmitting the data entered in the input mask, the date and time of sending will also be transmitted.</p>

          <p>Before transmitting your data via the contact form, you need to consent to the processing of the data. You will also find a reference to this privacy policy.<br/>
            Alternatively, you can contact us via the provided email address. In this case, your personal data transmitted by email will be stored.</p>

          <p>In this context, we will not disclose the data to third parties. The data is used exclusively for processing the conversation.</p>

          <p>The legal basis for the processing of the data is in the presence of your consent pursuant to Art. 6 (1) lit. a) GDPR.</p>

          <p>The legal basis for the processing of the data transmitted in the context of sending an email is Art. 6 (1) lit. f) GDPR. If the email contact aims to conclude a contract, Art. 6 (1) lit. b) GDPR is the additional legal basis for the processing.</p>

          <p>The processing of the personal data from the input mask serves us solely to process the contact. In case of a contact via email, this also includes the required legitimate interest in the processing of the data.</p>

          <p>The other personal data processed during the sending process serve to prevent misuse of the contact form and to ensure the security of our information technology systems.</p>

          <p>The data will be deleted as soon as it is no longer necessary for the purpose of its collection. For the personal data from the input mask of the contact form and those sent by email, this is the case when the respective conversation with you has ended. The conversation has ended when it can be inferred from the circumstances that the relevant facts have been finally clarified.</p>

          <p>The additional personal data collected during the sending process will be deleted after a period of seven days at the latest.</p>

          <p>You have the possibility at any time to revoke your consent to the processing of your personal data. If you contact us by email, you may object to the storage of your personal data at any time. In this case, the conversation can not be continued.</p>

          <p>If you wish to revoke your consent to the processing of personal data and refuse to store it, please send an email to <a href="mailto:legal@tba21-academy.org?Subject=Revocation%20of%20consent%20to%20the%20processing%20of%20personal%20data">legal@tba21-academy.org</a> with the subject "Revocation of consent to the processing of personal data" and enter your first name, last name, and email address.</p>

          <p>We will process your request as soon as possible.</p>

          <p>All personal data stored in the course of contacting will be deleted in this case.</p>

          <h2>9. Your Rights</h2>

          <h3>9.01 Right to Access</h3>

          <p>
            You may ask the controller to confirm if personal data concerning you is processed by us.<br/>
            If such processing is available, you can request information from the controller about the following information:
          </p>

          <p>
            a) the purposes for which the personal data are processed;<br />
            b) the categories of personal data being processed;<br />
            c) the recipients or categories of recipients to whom the personal data relating to you have been disclosed or are still being disclosed;<br />
            d) the planned duration of the storage of your personal data or, if specific information is not available, criteria for determining the duration of storage;<br />
            e) the existence of a right to rectification or erasure of personal data concerning you, a right to restriction of processing by the controller or a right to object to such processing;<br />
            f) the existence of a right of appeal to a supervisory authority;<br />
            g) all available information on the source of the data, if the personal data is not collected from the concerned person;<br />
            h) the existence of automated decision-making including profiling under Art. 22 (1) and (4) GDPR and, at least in these cases, meaningful information about the logic involved, and the scope and intended impact of such processing on the concerned person.<br />
          </p>

          <p>You have the right to request information about whether the personal data relating to you are transferred to a third country or to an international organization. In this context, you can request the appropriate guarantees in accordance with. Art. 46 GDPR in connection with the transfer.</p>

          <h3>9.02 Right to Rectification</h3>

          <p>You have a right to rectification and/or completion to the controller, provided the personal data you process is incorrect or incomplete. The controller must make the correction without delay.</p>

          <h3>9.03 Right to Erasure (‘Right to be Forgotten’)</h3>

          <p>(1) You may require the controller to erase personal data concerning you without delay, and the controller shall be obliged to erase that data without delay, if any of the following is true:</p>

          <p>
            a) Personal data concerning you are no longer necessary for the purposes for which they were collected or otherwise processed.<br />
            b) You withdraw consent, to which the processing pursuant to Art. 6 (1) lit. a) or Art. 9 (2) lit. a) GDPR was based and there is no other legal basis for processing.<br />
            c) You object to the processing pursuant to Art. 21 (1) GDPR and there are no overriding legitimate grounds for the processing, or you object to the processing pursuant to Art. 21 (2) GDPR.<br />
            d) Your personal data have been unlawfully processed.<br />
            e) The erasure of personal data concerning you have to erased for compliance with a legal obligation under Union law or the law of the Member States to which the controller is subject.<br />
            f) The personal data concerning you have been collected in relation to information society services offered referred to in Art. 8 (1) GDPR.<br />
          </p>

          <p>(2) Where the controller has made the personal data public and is obliged to erase the personal data pursuant to Art. 17 (1) GDPR, the controller, taking account of available technology and the cost of implementation, shall take reasonable steps, including technical measures, to inform controllers which are processing the personal data that you have requested the erasure by such controllers of any links to, or copy or replication of, those personal data.</p>

          <p>(3) The right to erasure does not exist to the extent the processing is necessary</p>

          <p>
            a) to exercise the right to freedom of expression and information;<br />
            b) to comply with a legal obligation which requires processing by Union or Member State law to which the controller is subject or for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller;<br />
            c) for reasons of public interest in the field of public health pursuant to Art. 9 (2) lit. h) and i) and Art. 9 (3) GDPR;<br />
            d) for archival purposes in the public interest, scientific or historical research purposes or for statistical purposes in accordance with Art. 89 (1) GDPR, to the extent that the law referred to in subparagraph a) is likely to render impossible or seriously impair the achievement of the objectives of that processing, or<br />
            e) for the establishment, exercise or defence legal claims.<br />
          </p>

          <h3>9.04 Right to Restriction of Processing</h3>

          <p>You may request the restriction of the processing of your personal data under the following conditions:</p>

          <p>
            a) if you contest the accuracy of your personal information for a period of time that enables the controller to verify the accuracy of your personal information;<br />
            b) the processing is unlawful and you refuse the deletion of the personal data and instead demand the restriction of the use of the personal data;<br />
            c) the controller no longer needs the personal data for the purposes of processing, but you need it for the purposes of asserting, exercising or defending legal claims; or<br />
            d) if you have objected to the processing pursuant to Art. 21 (1) GDPR and it is not yet certain whether the legitimate reasons of the controller outweigh your reasons.<br />
          </p>

          <p>If the processing of personal data concerning you has been restricted, this data may only be used with your consent or for the purposes of asserting, exercising or defending legal claims or protecting the rights of another natural or legal person or for reasons of important public interest Union or a Member State.</p>

          <p>If the restriction of the processing was limited due to the above mentioned conditions, you will be informed by the controller before the restriction is lifted.</p>

          <h3>9.05 Right to Information</h3>

          <p>If you have claimed the right of rectification, erasure or restriction of processing to the controller, the controller is obliged to notify all recipients to whom your personal data have been disclosed of this rectification or erasure of the data or restriction of processing, unless: this proves to be impossible or involves a disproportionate effort.<br />
          You have a right to be informed about these recipients by the controller.</p>

          <h3>9.06 Right to Data Portability</h3>

          <p>You have the right to receive personally identifiable information you provide to the controller in a structured, common and machine-readable format. In addition, you have the right to transmit those data to another controller without hindrance from the controller to which the personal data have been provided, where</p>

          <p>a) the processing is based on a consent pursuant to Art. 6 (1) lit. a) GDPR or Art. 9 (2) lit. a) GDPR or on a contract acc. Art. 6 (1) lit. b) GDPR is based and<br />
            b) the processing is carried out by automated means.</p>

          <p>In exercising this right to data portability, you also have the right to have the personal data relating to you transmitted directly from one controller to another controller, where technically feasible. Rights of other persons shall not be affected.</p>

          <p>The right to data portability does not apply to the processing of personal data necessary for the performance of a task in the public interest or in the exercise of official authority delegated to the controller.</p>

          <h3>9.07 Right to Object</h3>

          <p>
            You have the right at any time, on grounds relation to your particular situation, to object to processing of your personal data, which pursuant to Art. 6 (1) lit. e) or f) GDPR; this also applies to profiling based on these provisions.<br />
            The controller shall no longer process personal data concerning you unless the controller can demonstrate compelling legitimate grounds for processing that override your interests, rights and freedoms, or the processing or for the establishment, exercise or defense of legal claims.<br />
            Where personal data relating to you are processed for direct marketing purposes, you have the right to object at any time to the processing of your personal data for the purpose of such marketing; this also applies to profiling to the extent that it is related to such direct marketing.<br />
            Where you object to processing for direct marketing purposes, your personal data shall no longer be processed for such purposes.<br />
            In the context of the use of information society services, and notwithstanding Directive 2002/58/EC, you may exercise the right to object by automated means using technical specifications.
          </p>

          <h3>9.08 Right to Revoke the Data Protection Consent Declaration</h3>

          <p>You have the right to revoke your data protection consent declaration at any time. The revocation of consent does not affect the legality of the processing carried out on the basis of the consent until the revocation.</p>

          <h3>9.09 Right to Complain to a Supervisory Authority</h3>

          <p>Without prejudice to any other administrative or judicial remedy, you have the right to complain to a supervisory authority, in particular in the Member State of its residence, place of work or place of alleged infringement, if you believe that the processing of your personal data violates the GDPR.<br />
            The supervisory authority to which the complaint has been submitted shall inform the complainant of the status and results of the complaint, including the possibility of a judicial remedy pursuant to Art. 78 of the GDPR.</p>

          <h2>10. Changes to this Privacy Policy</h2>

          <p>This Privacy Policy may change from time to time to be in line with legislation or industry developments. We will not explicitly inform you of these changes. Thus, we recommend that you check this page periodically for any policy changes and updates. These changes are effective immediately after they are posted on this page.</p>
        </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state: { privacyPolicy: PrivacyPolicyState }) => ({
  open: state.privacyPolicy.open,
});

export default connect(mapStateToProps, { modalToggle })(PrivacyPolicy);

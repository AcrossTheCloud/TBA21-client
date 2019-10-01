import * as React from 'react';
import { connect } from 'react-redux';
import { PrivacyPolicyState } from 'reducers/pages/privacyPolicy';
import { modalToggle } from 'actions/pages/privacyPolicy';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

import 'styles/components/admin/tables/modal.scss';

interface Props extends PrivacyPolicyState {
  modalToggle: Function;
}

class TermsAndConditions extends React.Component<Props, {}> {
  render() {
    return (
      <Modal isOpen={this.props.tc_open} toggle={() => this.props.modalToggle('TC_MODAL')} className="fullwidth blue">
          <ModalHeader toggle={() => this.props.modalToggle('TC_MODAL')}>TERMS OF USE</ModalHeader>
          <ModalBody>
              <p>
                  Please read these Terms of Use (may also be referred to as “Terms” or "Agreement") carefully before using the services offered by Thyssen-Bornemisza Art Contemporary Privatstiftung, hereinafter "TBA21", "we" or "us". Although the term "Ocean Archive" is used in the following, the legal relationship is concluded with TBA21 as the operator of the Ocean Archive.
             </p>

              <h3>1. Definition</h3>
              <p>
                  Visitors: a person that is not logged-in<br/>
                  User: a person that is logged-in
             </p>

              <h3>2. Offered Services </h3>
              <p>The Ocean Archive is a platform operating at the intersection of scientific inquiry, artistic intelligence, and environmental advocacy. The Ocean Archive is committed to the following objectives:</p>

              <ul>
                  <li><p>Host and produce material by a multiplicity of voices to share human and non-human stories of the ocean across various media;</p>

                  </li>
                  <li><p>Render visible and discoverable a range of disciplinary perspectives and connect individuals, groups, and institutions committed to a living ocean;</p>

                  </li>
                  <li><p>Create novel webs of knowledge by facilitating ocean explorations through archive material and supporting synergies among the arts, sciences, and policy.</p>

                  </li>
              </ul>

              <h3>3. Acceptance of Terms of Use</h3>

              <p>These Terms of Use and conditions apply to all users and visitors of the Ocean Archive, including the Privacy Policy available at ocean-archive.org/privacy, and all other operating rules, policies, and procedures that may be published on our site by us.</p>

              <p>Please review all rules, policies, and procedures governing the use of our services, especially the Privacy Policy so you are aware of how we collect and use your personal information.</p>

              <p>All rules, policies, and procedures governing the use of our services are incorporated by reference into these Terms of Use and may be updated by us without further notice. If you do not agree, you do not have permission to use any of our services.</p>

              <h3>4. Registration</h3>

              <p>To participate in the Ocean Archive we invite you to register directly at ocean-archive.org.</p>

              <p>The registration is free of charge. However, you must not use or register if you are under the age of majority in your jurisdiction (typically age 18). If you use the website, you hereby represent and warrant that you are not under the age of majority in your jurisdiction.</p>

              <p>If you register, you agree to provide true, accurate and complete information about yourself. You also agree to keep registration information, up-to-date to maintain its truth, accuracy and completeness.</p>

              <h3>5. Intellectual Property and Licensing</h3>

              <p>You agree not to infringe or challenge any of the intellectual property rights owned or licensed by TBA21.</p>

              <p>By transmitting or submitting any content through or to the offered services or otherwise, you affirm, represent and warrant that such transmission or submission is accurate, not in violation of any applicable laws, not in violation of contractual restrictions or infringes upon the rights of any third party, and that you have full permission from any third party whose personal information or intellectual property is comprised in the content or that the content is in the public domain or available under a Creative Commons license or other terms permitting upload to the Ocean Archive. This includes, but is not limited, copyright, trademark, privacy, publicity, or other personal or proprietary rights.</p>

              <p>TBA21 will not have any ownership rights over your submitted content. However, you hereby grant us and our affiliates a perpetual, non-revocable, non-exclusive, worldwide and royalty free license use the content. This includes, but is not limited, to the right to copy, reproduce, modify, translate, publish, distribute, transmit, publicly display, broadcast and/or communicate to the public by telecommunication your submitted content as well as all modified and derivative the content thereof in connection with our provision of the service, including marketing and promotions thereof.</p>

              <p>In addition, by transmitting or submitting any content through or to the offered services or otherwise, you agree that your content is hereby licensed under the Creative Commons Attribution 4.0 License CC BY-NC to users of the Ocean Archive and may be used under the terms of that license or any later version of a Creative Commons Attribution License. This license lets others remix, tweak, and build upon your work non-commercially, and although their new content must also acknowledge you and be non-commercial, they don’t have to license their derivative content on the same terms. The full licensing terms for CC BY-NC 4.0 can be reviewed under https://creativecommons.org/licenses/by-nc/4.0/legalcode.</p>

              <p>Please be aware that you are entirely responsible for all submitted content you post or otherwise transmit via and/or to us.</p>

              <p>TBA21 reserves the right to block, disable, delete or otherwise remove any materials from the offered service as well as terminate access to the service if you engage in copyright or other intellectual property infringement or for any other reason.</p>

              <p>If you believe that any content or materials on the Ocean Archive infringe your copyrights, contact the TBA21 copyright agent, who can be reached at <a href="mailto:legal@ocean-archive.org?subject=Copright%20notification">legal@ocean-archive.org</a>. The notification must meet the requirements of the Digital Millennium Copyright Act and/or alike legal regulations.</p>

              <h3>6. Termination of Account and Service</h3>

              <p>TBA21 may terminate your access to the service without cause or notice, which may result in the forfeiture and destruction of all information associated with your account. If you wish to terminate your account, you may do so by terminating your account via your profile page. Alternatively, you can send us a termination request by email to <a href="mailto:legal@ocean-archive.org?subject=Account%20termination" >legal@ocean-archive.org</a>. With the termination of your account, all items that you have contributed and also any collections for which you are the sole contributor will be deleted. All provisions of the Terms of Use that by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>

              <h3>7. Interactions</h3>

              <p>Your interactions with other users or other third parties are solely between you and such individuals or entities. We cannot guarantee the authenticity of any data or information that users provide about themselves. You should make whatever investigation you feel necessary or appropriate before engaging. You agree that TBA21 shall not be responsible or liable for any loss or damage of any sort incurred in this context.</p>

              <p>You further acknowledge that we have no duty to take any action regarding any of the following: which users gain access to the Site; what content users access through our site or how users may interpret the content and their reactions.</p>

              <h3>8. Warranties</h3>

              <p>To the fullest extent permitted by local law, you understand and agree that the services available on our site are provided "AS IS" and that we assume no responsibility for the timeliness, deletion, mis-delivery or failure to store any user submitted information, data or personalization settings.</p>

              <p>We make no representations or warranties of any kind concerning the services, expressly, implied.</p>

              <p>You understand and agree that temporary interruptions or errors of our services or services available through our site may occur as normal events. We further do not warrant that content made available through our services will be error-free.</p>

              <p>You further understand and agree that we have no control over third party sites and networks you may access in the course of using our site. Therefore, delays and disruption of other network transmissions are completely beyond our control.</p>

              <p>Further TBA21 does not warrant or make any representation regarding the use of the content available through our services in terms of accuracy, reliability, or otherwise.</p>

              <h3>9. Indemnification</h3>

              <p>You hereby indemnify and hold harmless TBA21 and its affiliates' partners, contractors, employees and representatives (hereinafter: "affiliates") from and against any claims, actions, damages, expenses, liabilities and costs arising from or relating to the use of the service and content or the providing of content.</p>

              <h3>10. Liability</h3>

              <p>To the fullest extent permitted by local law, you agree that neither TBA21, nor any of its affiliates shall be liable for all claims for compensation and cases of liability to you and/or any third party, irrespective of their legal grounds (including, but not limited to warranty, breach of duty, unlawful act, modification, alteration, or termination of the offered services), with the exception of claims due to injury to life, body and health and fraudulent intent. The legal provisions apply in the event of these exceptions.</p>

              <p>We are not obliged to monitor third party information provided or stored on our website. However, we shall promptly remove any content upon becoming aware that it violates the law. Our liability in such an instance shall commence at the time we become aware of the respective violation.</p>

              <p>Our site contains links to third-party websites. We have no influence whatsoever on the information on these websites and accept no guarantee for its correctness. The content of such third-party sites is the responsibility of the respective owners/providers. If you access a third-party website from our website, you do so at your own risk. The inclusion of such a link or reference on our website is provided merely as a convenience and does not imply endorsement of, or association with, the site or party by us, or any warranty of any kind, being either expressed or implied.</p>

              <h3>11. Entire Agreement</h3>

              <p>These Terms of Use, any supplemental rules, policies, procedures and any documents expressly incorporated by reference herein contain the whole understanding between TBA21 and you and supersede any understanding or previous agreements between both of these parties relating to the subject matter covered by the understanding. No waiver or variation of this understanding will be effective unless approved in writing by the duly authorized representatives of the previously mentioned parties.</p>

              <h3>12. International Access</h3>

              <p>The Ocean Archive is controlled and operated from within Austria. Accessing the service is prohibited from territories where the content is illegal. If you access the service from other locations, you do so based on your own initiative and are responsible for compliance with local laws.</p>

              <h3>13. Applicable Law and Place of Jurisdiction</h3>

              <p>These Terms are exclusively governed by the laws of Austria with exception of the United Nations Convention on Contracts for the International Sale of Goods (CISG). The place of jurisdiction shall be the ordinary courts of Vienna, Austria.</p>

              <h3>14. Miscellaneous</h3>

              <p>We reserve the right, at our discretion, to modify, remove or add to these Terms at any time. You can access the current version at ocean-archive.org/terms. We will always indicate the date of the latest revision. Your continued use of any services after new and/or revised Terms are effective indicates that you have read, understood, and agreed to those Terms.</p>

              <p>In the event of a conflict between the different translations of these Terms, the English version shall prevail.</p>

              <p>In the event that one or more current or future provisions of these Terms shall be, or shall be deemed to be, fully or partly, invalid or unenforceable, the validity and enforceability of the other provisions shall not be affected thereby. The invalid or unenforceable provision shall be replaced by such appropriate provision that, to the extent legally permissible, comes closest to the actual or assumed intention of these Terms as of the date of the amendment of these Terms.</p>

            <h4 className="pt-5">Third Party Image Credits</h4>
            <p>
              Christian Alexander Tietgen <br/>
              <a title="Christian Alexander Tietgen [CC BY-SA 3.0 (https://creativecommons.org/licenses/by-sa/3.0)], via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Unscharfe_Zeitung.jpg">
                Unscharfe Zeitung
              </a>
            </p>

          </ModalBody>
      </Modal>
    );
  }
}

const mapStateToProps = (state: { privacyPolicy: PrivacyPolicyState }) => ({
  tc_open: state.privacyPolicy.tc_open,
});

export default connect(mapStateToProps, { modalToggle })(TermsAndConditions);

import React from 'react';
import { ArrowLeft, Shield, FileText, CheckCircle, ExternalLink, Printer } from 'lucide-react';

export default function TermsOfUse({ onBack }) {
  const tableOfContents = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. Eligibility' },
    { id: 'account-security', title: '3. Account Registration and Security' },
    { id: 'description', title: '4. Description of Service' },
    { id: 'license', title: '5. License and Permitted Use' },
    { id: 'prohibited-conduct', title: '6. Prohibited Conduct' },
    { id: 'intellectual-property', title: '7. Intellectual Property Rights' },
    { id: 'user-content', title: '8. User Content' },
    { id: 'collaborative-spaces', title: '9. Collaborative Spaces' },
    { id: 'third-party-content', title: '10. Third-Party Content and Links' },
    { id: 'ai-features', title: '11. AI and Machine-Learning Features' },
    { id: 'push-notifications', title: '12. Push Notifications' },
    { id: 'service-availability', title: '13. Service Availability and Changes' },
    { id: 'disclaimers', title: '14. Disclaimers' },
    { id: 'limitation-liability', title: '15. Limitation of Liability' },
    { id: 'indemnification', title: '16. Indemnification' },
    { id: 'termination', title: '17. Termination and Account Deletion' },
    { id: 'governing-law', title: '18. Governing Law and Dispute Resolution' },
    { id: 'apple-terms', title: '19. Apple App Store Additional Terms' },
    { id: 'paid-features', title: '20. Paid Features and Future Pricing' },
    { id: 'general-provisions', title: '21. General Provisions' },
    { id: 'contact', title: '22. Contact Us' },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="legal-page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="legal-header">
          <button className="legal-back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to LinQ Overview</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="app-pill-badge">Legal Documentation</span>
          </div>

          <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
            Terms of <span className="text-gradient">Use</span>
          </h1>

          <div className="legal-meta-row">
            <span>Last Updated: October 7, 2026</span>
          </div>
        </div>

        {/* Layout */}
        <div className="legal-layout">
          {/* Sidebar Table of Contents */}
          <aside className="legal-sidebar">
            <div className="sidebar-title">Table of Contents</div>
            <ul className="sidebar-nav-list">
              {tableOfContents.map((item) => (
                <li key={item.id} className="sidebar-nav-item">
                  <a 
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%', gap: '8px' }}
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>
            </div>
          </aside>

          {/* Legal Content Body */}
          <div className="legal-content-body">
            <section id="acceptance">
              <h2>1. Acceptance of Terms</h2>
              <p>Welcome to LinQ. These Terms of Use ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and the developer and operator of LinQ ("LinQ," "we," "our," or "us") governing your access to and use of the LinQ mobile application (the "App"), including its features, content, and services.</p>
              <p>By downloading, installing, accessing, or using the App, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you must not download, install, or use the App.</p>
              <p>We may modify these Terms from time to time. If we make material changes, we will provide reasonable notice through the App, our website, or other appropriate means. Your continued use of the App after the updated Terms become effective constitutes your acceptance of the revised Terms.</p>
            </section>

            <section id="eligibility">
              <h2>2. Eligibility</h2>
              <p>To use the App, you must:</p>
              <ul>
                <li>Be at least 13 years of age, or the minimum age of digital consent applicable in your jurisdiction, whichever is higher where required by law.</li>
                <li>Have the legal capacity to enter into a binding agreement, or use the App with appropriate authorization where required by applicable law.</li>
                <li>Not be prohibited from using the App under applicable law.</li>
              </ul>
              <p>If you use the App on behalf of an organization or other legal entity, you represent and warrant that you have authority to bind that organization or entity to these Terms.</p>
            </section>

            <section id="account-security">
              <h2>3. Account Registration and Security</h2>
              <h3>3.1 Account Creation</h3>
              <p>Certain features of LinQ require an account. Depending on availability, you may create an account using:</p>
              <ul>
                <li>Email and password;</li>
                <li>Sign in with Apple; or</li>
                <li>Sign in with Google.</li>
              </ul>
              <p>You agree to:</p>
              <ul>
                <li>Provide accurate and current information when creating your account.</li>
                <li>Maintain the accuracy of your account information.</li>
                <li>Keep your authentication credentials secure.</li>
                <li>Not share your account credentials with unauthorized persons.</li>
                <li>Notify us promptly if you believe your account has been accessed or used without authorization.</li>
              </ul>
              <p>You are responsible for activity conducted through your account, except to the extent that applicable law provides otherwise.</p>
              <p>Authentication and account information may be processed through third-party authentication and infrastructure services used to operate LinQ, as described in our Privacy Policy.</p>
              
              <h3>3.2 Guest Mode</h3>
              <p>LinQ may allow you to use certain features without creating an account through Guest Mode.</p>
              <p>In Guest Mode:</p>
              <ul>
                <li>Your saved content is primarily maintained on your device for use within the Guest Mode experience.</li>
                <li>Guest Mode does not provide the same cloud synchronization and Collaborative Space functionality available to registered users.</li>
                <li>Saved URLs may be transmitted to LinQ's servers for processing, including embedding generation and features that require server-side processing.</li>
                <li>Local data may be permanently lost if you uninstall the App, reset your device, lose access to the device, or otherwise delete the locally stored data.</li>
                <li>Guest Mode data does not automatically transfer to a new device unless the applicable feature expressly provides for such transfer.</li>
              </ul>
              <p>You are responsible for maintaining any important information stored through Guest Mode.</p>
            </section>

            <section id="description">
              <h2>4. Description of Service</h2>
              <p>LinQ is an intelligent content management application that enables you to:</p>
              <ul>
                <li>Save and organize web content, including URLs, articles, videos, and other online resources.</li>
                <li>Save content from supported iOS applications using the Share Extension.</li>
                <li>Organize saved content using tags, categories, collections, and related features.</li>
                <li>Use artificial intelligence and machine-learning technologies to generate or support tags, summaries, categories, semantic search, and other intelligent features.</li>
                <li>Search saved content using keyword and semantic search capabilities.</li>
                <li>Set time-based reminders for saved content.</li>
                <li>Create and participate in Collaborative Spaces for shared content management.</li>
                <li>Synchronize supported content and account information through LinQ's cloud infrastructure.</li>
                <li>Use other features that LinQ may introduce, modify, or discontinue from time to time.</li>
              </ul>
              <p>LinQ may change, add, suspend, or discontinue features of the App as the service develops.</p>
            </section>

            <section id="license">
              <h2>5. License and Permitted Use</h2>
              <p>Subject to these Terms, LinQ grants you a limited, non-exclusive, non-transferable, revocable license to access and use the App for lawful personal, educational, professional, or internal business purposes.</p>
              <p>You may not use the App in a manner that violates these Terms or applicable law.</p>
              <p>Except for the rights expressly granted under these Terms, no rights in or to the App are transferred to you.</p>
            </section>

            <section id="prohibited-conduct">
              <h2>6. Prohibited Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the App for any unlawful, harmful, fraudulent, or unauthorized purpose.</li>
                <li>Violate any applicable local, state, national, or international law or regulation.</li>
                <li>Use the App to distribute or facilitate unlawful, threatening, harassing, hateful, or otherwise prohibited material.</li>
                <li>Use Collaborative Spaces to distribute content that violates these Terms or applicable law.</li>
                <li>Infringe or violate the intellectual property, privacy, publicity, or other rights of any person or entity.</li>
                <li>Upload or transmit viruses, malware, malicious code, or other harmful software.</li>
                <li>Attempt to gain unauthorized access to the App, other accounts, or systems or networks connected to the App.</li>
                <li>Interfere with or disrupt the integrity, performance, availability, or security of the App or its related services.</li>
                <li>Use Collaborative Spaces to send unsolicited communications, spam, or unauthorized promotional material.</li>
                <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of the App, except to the extent such restriction is prohibited by applicable law.</li>
                <li>Use automated scripts, bots, crawlers, scrapers, or similar methods to access or interact with the App without our prior written authorization.</li>
                <li>Impersonate another person or entity or falsely represent your affiliation with another person or entity.</li>
                <li>Circumvent, disable, or interfere with security or access-control features of the App.</li>
                <li>Resell, redistribute, sublicense, or commercially exploit the App or any part of it without our authorization.</li>
                <li>Use the App to facilitate abuse, fraud, or unauthorized access to third-party systems or services.</li>
              </ul>
              <p>Violation of these restrictions may result in suspension or termination of your access to the App and may subject you to legal liability.</p>
            </section>

            <section id="intellectual-property">
              <h2>7. Intellectual Property Rights</h2>
              <h3>7.1 Our Intellectual Property</h3>
              <p>The App, including its software, design, user interface, graphics, logos, trademarks, features, functionality, and other original materials provided by LinQ, is owned by or licensed to LinQ and is protected by applicable intellectual property laws.</p>
              <p>These Terms do not grant you ownership of the App or any of LinQ's intellectual property.</p>
              
              <h3>7.2 Trademarks</h3>
              <p>"LinQ" and related names, logos, designs, and product identifiers are owned by or used by LinQ and may be protected by applicable trademark laws.</p>
              <p>You may not use LinQ's trademarks, logos, or branding without prior written authorization.</p>
            </section>

            <section id="user-content">
              <h2>8. User Content</h2>
              <h3>8.1 Your Content</h3>
              <p>"User Content" means information or content that you save, create, upload, organize, or share through the App, including bookmarks, URLs, tags, categories, collection names, notes, and content associated with Collaborative Spaces.</p>
              <p>You retain ownership of your User Content.</p>
              <p>To operate LinQ, you grant us a limited, non-exclusive, worldwide, royalty-free license to host, store, transmit, process, reproduce where technically necessary, and display your User Content solely as reasonably necessary to:</p>
              <ul>
                <li>Provide and operate the App;</li>
                <li>Synchronize your content across supported devices;</li>
                <li>Provide search, organization, semantic search, embedding, AI-assisted, and other requested features;</li>
                <li>Display content to you;</li>
                <li>Display content to members of a Collaborative Space when you choose to share it;</li>
                <li>Maintain, secure, troubleshoot, and improve the functionality of the App.</li>
              </ul>
              <p>We do not acquire ownership of your User Content through this license.</p>
              <p>This license ends when your User Content is deleted or your account is deleted, except to the extent that continued retention or processing is required for legal, security, backup, fraud-prevention, or other legitimate operational purposes described in our Privacy Policy.</p>
              
              <h3>8.2 Content Responsibility</h3>
              <p>You are responsible for your User Content and the consequences of saving, sharing, or transmitting it through LinQ.</p>
              <p>You represent and warrant that:</p>
              <ul>
                <li>You have the necessary rights or authorization to save and share the content you submit.</li>
                <li>Your use of User Content through LinQ does not knowingly infringe third-party intellectual property, privacy, publicity, or other rights.</li>
                <li>Your User Content and use of the App comply with these Terms and applicable law.</li>
              </ul>

              <h3>8.3 Content Removal</h3>
              <p>We may remove, restrict, or disable access to User Content or Collaborative Spaces when reasonably necessary to:</p>
              <ul>
                <li>Comply with applicable law or legal requests;</li>
                <li>Enforce these Terms;</li>
                <li>Protect users, LinQ, or third parties;</li>
                <li>Address security, abuse, or fraud;</li>
                <li>Respond to valid reports or complaints.</li>
              </ul>
              <p>We do not represent that we routinely review all private User Content.</p>
            </section>

            <section id="collaborative-spaces">
              <h2>9. Collaborative Spaces</h2>
              <h3>9.1 Creation and Ownership</h3>
              <p>Collaborative Spaces allow users to organize and share content with other LinQ users.</p>
              <p>The user who creates a Collaborative Space is its owner and is responsible for managing membership and activity within the Space.</p>
              <p>A Collaborative Space cannot be manually deleted by its owner.</p>
              <p>A Collaborative Space is automatically removed when its last remaining member leaves the Space.</p>
              
              <h3>9.2 Member Management</h3>
              <p>Only the Space owner may remove members from a Collaborative Space.</p>
              <p>Members may leave a Collaborative Space at any time.</p>
              <p>When a member leaves a Space, content that the member previously contributed to that Space remains within the Space and may continue to be accessible to the remaining members, subject to the functionality and policies of the App.</p>

              <h3>9.3 Shared Content</h3>
              <p>Content shared within a Collaborative Space may be visible to and accessible by other members of that Space.</p>
              <p>By sharing content in a Collaborative Space, you acknowledge that other members may view, interact with, copy, or otherwise use that content.</p>
              <p>You should only share content that you are authorized to share and that you are comfortable making available to the members of that Space.</p>
              <p>LinQ is not responsible for how other members use or redistribute content that you choose to share with them, except to the extent required by applicable law.</p>

              <h3>9.4 Space Rules</h3>
              <p>Space owners and members must use Collaborative Spaces in accordance with these Terms.</p>
              <p>We may restrict, suspend, or disable a Collaborative Space or member access when reasonably necessary to enforce these Terms, comply with law, protect users, or address security or abuse.</p>
            </section>

            <section id="third-party-content">
              <h2>10. Third-Party Content and Links</h2>
              <p>LinQ allows you to save and organize links to websites and content operated by third parties.</p>
              <p>LinQ does not own, control, or endorse third-party websites or content merely because you save or access a link through the App.</p>
              <p>We are not responsible for:</p>
              <ul>
                <li>The accuracy, legality, availability, or appropriateness of third-party content.</li>
                <li>Changes to or removal of third-party webpages.</li>
                <li>Transactions or interactions between you and third-party services.</li>
                <li>The terms, privacy practices, or security practices of third-party websites.</li>
                <li>Losses resulting from your access to or use of third-party content.</li>
              </ul>
              <p>Your interactions with third-party websites and services are governed by their respective terms of service and privacy policies.</p>
              <p>Saving a link through LinQ does not grant you ownership of the underlying third-party content.</p>
            </section>

            <section id="ai-features">
              <h2>11. AI and Machine-Learning Features</h2>
              <p>LinQ uses artificial intelligence and machine-learning technologies, including services and models provided by NVIDIA Neotron and Google Gemini, to support certain features of the App.</p>
              <p>These features may include, depending on the functionality available:</p>
              <ul>
                <li>Semantic search;</li>
                <li>Embedding generation;</li>
                <li>Content categorization;</li>
                <li>Tag suggestions;</li>
                <li>Summaries;</li>
                <li>Other intelligent organization features.</li>
              </ul>

              <h3>11.1 URL Processing</h3>
              <p>When you save a URL, LinQ may transmit that URL to LinQ's servers for processing.</p>
              <p>The URL is processed for purposes including generating embeddings and providing LinQ's AI-powered and semantic-search functionality.</p>
              <p>URLs submitted for this processing are not intended to contain personal information. You should avoid intentionally placing sensitive personal information in URLs saved through LinQ.</p>

              <h3>11.2 AI Limitations</h3>
              <p>AI-generated or AI-assisted results may be incomplete, inaccurate, outdated, or inappropriate.</p>
              <p>You are responsible for reviewing AI-generated tags, summaries, categories, search results, and other AI-assisted output before relying on them.</p>
              <p>LinQ does not guarantee that AI-generated content will be accurate, complete, reliable, or suitable for any particular purpose.</p>

              <h3>11.3 AI Model Training</h3>
              <p>User URLs processed for LinQ's embedding and AI functionality are not intentionally used by LinQ to train general-purpose AI models.</p>
              <p>This does not prevent third-party service providers from processing data as necessary to provide the services used by LinQ, subject to their applicable agreements and privacy practices.</p>
              <p>Additional information about data processing is provided in our Privacy Policy.</p>
            </section>

            <section id="push-notifications">
              <h2>12. Push Notifications</h2>
              <p>LinQ may send push notifications for purposes including:</p>
              <ul>
                <li>Content reminders you have scheduled;</li>
                <li>Collaborative Space activity;</li>
                <li>New members joining a Space;</li>
                <li>New content shared within a Space;</li>
                <li>Invitations to join Collaborative Spaces;</li>
                <li>Important service-related announcements.</li>
              </ul>
              <p>You can manage notification permissions and preferences through the App and your iOS device settings, where supported.</p>
              <p>Some service-related communications may be necessary for the operation or security of the App.</p>
            </section>

            <section id="service-availability">
              <h2>13. Service Availability and Changes</h2>
              <p>LinQ is continuously developed and may change over time.</p>
              <p>We may, at our discretion:</p>
              <ul>
                <li>Add new features;</li>
                <li>Modify existing features;</li>
                <li>Remove or discontinue features;</li>
                <li>Change technical requirements;</li>
                <li>Change supported iOS versions;</li>
                <li>Suspend portions of the service;</li>
                <li>Discontinue the App or related services.</li>
              </ul>
              <p>We will make reasonable efforts to provide notice of material changes where required by applicable law.</p>
              <p>We do not guarantee that any particular feature will remain available indefinitely.</p>
            </section>

            <section id="disclaimers">
              <h2>14. Disclaimers</h2>
              <h3>14.1 "As Is" Basis</h3>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE APP IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.</p>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.</p>

              <h3>14.2 No Guarantee of Availability</h3>
              <p>We do not warrant that:</p>
              <ul>
                <li>The App will always be available or uninterrupted.</li>
                <li>The App will be secure or error-free.</li>
                <li>The results obtained through the App will always be accurate or reliable.</li>
                <li>Defects will always be corrected.</li>
                <li>The App will be compatible with every device or version of iOS.</li>
                <li>Cloud synchronization or other network-dependent functionality will always operate without interruption.</li>
              </ul>

              <h3>14.3 Data Loss</h3>
              <p>Although we implement reasonable measures designed to protect user data, no digital service can guarantee that data will never be lost, corrupted, unavailable, or accessed without authorization.</p>
              <p>You are responsible for maintaining appropriate copies of important information.</p>
              <p>This is particularly important when using Guest Mode or any feature that stores information locally on your device.</p>
            </section>

            <section id="limitation-liability">
              <h2>15. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LINQ AND ITS DEVELOPERS, OFFICERS, EMPLOYEES, CONTRACTORS, AGENTS, AND AFFILIATES WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, GOODWILL, DATA, OR OTHER INTANGIBLE LOSSES ARISING FROM OR RELATED TO:</p>
              <ul>
                <li>Your use of or inability to use the App;</li>
                <li>Unauthorized access to your account or data;</li>
                <li>User Content;</li>
                <li>Content shared through Collaborative Spaces;</li>
                <li>Third-party websites or services;</li>
                <li>Interruption or termination of the App;</li>
                <li>Bugs, errors, malware, or other harmful code;</li>
                <li>Loss or corruption of data;</li>
                <li>AI-generated or AI-assisted content;</li>
                <li>Any other matter relating to the App.</li>
              </ul>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, LINQ'S TOTAL LIABILITY FOR CLAIMS ARISING OUT OF OR RELATING TO THE APP OR THESE TERMS WILL NOT EXCEED THE GREATER OF:</p>
              <ul>
                <li>THE AMOUNT YOU PAID TO LINQ FOR THE APP OR RELEVANT SERVICES DURING THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM; OR</li>
                <li>THE MINIMUM AMOUNT REQUIRED BY APPLICABLE LAW.</li>
              </ul>
              <p>Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.</p>
            </section>

            <section id="indemnification">
              <h2>16. Indemnification</h2>
              <p>To the extent permitted by applicable law, you agree to indemnify and hold harmless LinQ and its developers, officers, employees, contractors, agents, and affiliates from claims, liabilities, damages, losses, costs, and reasonable expenses arising from:</p>
              <ul>
                <li>Your violation of these Terms;</li>
                <li>Your unlawful use of the App;</li>
                <li>Your User Content;</li>
                <li>Content you share through Collaborative Spaces;</li>
                <li>Your violation of third-party rights; or</li>
                <li>Your misuse of the App.</li>
              </ul>
              <p>This section does not require you to indemnify LinQ for claims caused by LinQ's own unlawful conduct or other circumstances where such indemnification would be prohibited by applicable law.</p>
            </section>

            <section id="termination">
              <h2>17. Termination and Account Deletion</h2>
              <h3>17.1 Termination by You</h3>
              <p>You may stop using LinQ at any time.</p>
              <p>Registered users may delete their LinQ account using the account-deletion functionality available within the App.</p>
              <p>Deleting the App from your device does not necessarily delete your LinQ account or cloud-stored data.</p>

              <h3>17.2 Termination by Us</h3>
              <p>We may suspend or terminate your account or access to LinQ where reasonably necessary, including if:</p>
              <ul>
                <li>You materially violate these Terms;</li>
                <li>You engage in fraudulent, abusive, or unlawful activity;</li>
                <li>Your use presents a security or safety risk;</li>
                <li>We are legally required to do so;</li>
                <li>Your account is used to harm other users or LinQ; or</li>
                <li>We discontinue the relevant service.</li>
              </ul>
              <p>Where reasonably practicable and legally permitted, we may provide notice before termination or suspension.</p>

              <h3>17.3 Effect of Termination</h3>
              <p>Upon termination:</p>
              <ul>
                <li>Your right to use the App ceases.</li>
                <li>Access to account-based features may be disabled.</li>
                <li>Your data may be deleted in accordance with our Privacy Policy and applicable retention requirements.</li>
                <li>Content already shared within a Collaborative Space may remain accessible to other members in accordance with the functionality of the Space and these Terms.</li>
              </ul>
              <p>Provisions that by their nature should survive termination will continue to apply, including provisions relating to intellectual property, User Content, disclaimers, limitations of liability, indemnification, and dispute resolution.</p>
            </section>

            <section id="governing-law">
              <h2>18. Governing Law and Dispute Resolution</h2>
              <h3>18.1 Governing Law</h3>
              <p>These Terms shall be governed by and interpreted in accordance with the laws of India, without regard to conflict-of-law principles, except where applicable law requires otherwise.</p>
              
              <h3>18.2 Dispute Resolution</h3>
              <p>If a dispute arises between you and LinQ relating to these Terms or the App, the parties should first attempt to resolve the dispute in good faith.</p>
              <p>If the dispute cannot be resolved through good-faith discussions, either party may seek relief from a court of competent jurisdiction, subject to applicable law.</p>
              <p>To the extent permitted by applicable law, courts having jurisdiction in Dehradun, Uttarakhand, India, shall have jurisdiction over disputes arising from these Terms.</p>
              <p>Nothing in this section limits any mandatory consumer rights or remedies available to you under applicable law.</p>

              <h3>18.3 Individual Claims</h3>
              <p>To the extent permitted by applicable law, claims relating to your individual use of the App should be brought on an individual basis rather than as part of a class, collective, consolidated, or representative action.</p>
            </section>

            <section id="apple-terms">
              <h2>19. Apple App Store Additional Terms</h2>
              <p>If you downloaded LinQ from the Apple App Store, the following terms apply:</p>
              <ul>
                <li>These Terms are between you and LinQ, and not with Apple Inc. ("Apple").</li>
                <li>LinQ, and not Apple, is responsible for the App and its content.</li>
                <li>Your use of the App must comply with the applicable Apple App Store Terms of Service.</li>
                <li>Apple has no obligation to provide maintenance or support services for the App.</li>
                <li>To the extent required under applicable law, Apple may have refund obligations regarding the App or purchases made through Apple's payment systems.</li>
                <li>Apple is not responsible for addressing claims relating to the App, including product liability claims, claims that the App fails to comply with applicable legal requirements, or claims arising under consumer protection laws.</li>
                <li>In the event of a third-party claim that the App or your possession and use of the App infringes that third party's intellectual property rights, LinQ, and not Apple, will be responsible for the investigation, defense, settlement, and resolution of that claim to the extent required by Apple's applicable terms.</li>
                <li>Apple and its subsidiaries are third-party beneficiaries of these Terms and, upon your acceptance of these Terms, Apple will have the right to enforce these Terms against you as a third-party beneficiary.</li>
                <li>You represent that you are not located in a country subject to applicable U.S. Government embargoes and are not listed on applicable U.S. Government restricted-party lists, to the extent required by Apple's applicable terms.</li>
              </ul>
            </section>

            <section id="paid-features">
              <h2>20. Paid Features and Future Pricing</h2>
              <p>LinQ may initially provide certain functionality free of charge and may impose usage limits on free access.</p>
              <p>In the future, LinQ may introduce paid features, subscriptions, usage-based pricing, or other paid services.</p>
              <p>If paid services are introduced:</p>
              <ul>
                <li>Applicable pricing will be presented before you are charged.</li>
                <li>Any subscription or purchase will be subject to the applicable purchase terms.</li>
                <li>Purchases made through the Apple App Store may be subject to Apple's payment, subscription, refund, and cancellation terms.</li>
                <li>We will provide any notices required by applicable law before introducing or materially changing paid services.</li>
              </ul>
              <p>The introduction of paid features does not automatically make previously free functionality paid unless we clearly communicate the applicable change.</p>
            </section>

            <section id="general-provisions">
              <h2>21. General Provisions</h2>
              <h3>21.1 Entire Agreement</h3>
              <p>These Terms, together with our Privacy Policy and any additional terms specifically applicable to particular features, constitute the entire agreement between you and LinQ regarding your use of the App and supersede prior agreements relating to the same subject matter.</p>

              <h3>21.2 Severability</h3>
              <p>If any provision of these Terms is found to be unlawful, invalid, or unenforceable, that provision will be enforced to the maximum extent permitted by law, and the remaining provisions will remain in effect.</p>

              <h3>21.3 Waiver</h3>
              <p>Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.</p>

              <h3>21.4 Assignment</h3>
              <p>You may not assign or transfer your rights or obligations under these Terms without our prior written consent, except where permitted by applicable law.</p>
              <p>We may assign or transfer our rights and obligations under these Terms in connection with a merger, acquisition, restructuring, sale of assets, or similar transaction.</p>

              <h3>21.5 Force Majeure</h3>
              <p>LinQ will not be responsible for delays or failures caused by circumstances beyond our reasonable control, including natural disasters, war, terrorism, government actions, power failures, internet or telecommunications failures, cyber incidents, infrastructure failures, or outages of third-party services.</p>
            </section>

            <section id="contact">
              <h2>22. Contact Us</h2>
              <p>If you have questions, concerns, requests, or feedback regarding these Terms, please contact us:</p>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div><strong>LinQ — Legal</strong></div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  Email: <a href="mailto:support@linqapp.com" style={{ color: '#38bdf8' }}>support@linqapp.com</a>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  Website: <a href="https://www.linqapp.com" style={{ color: '#38bdf8' }} target="_blank" rel="noopener noreferrer">https://www.linqapp.com</a>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                  Location: Dehradun, Uttarakhand, India
                </div>
              </div>
              <p style={{ marginTop: '16px', fontSize: '0.9rem', color: '#64748b' }}>These Terms of Use are effective as of October 7, 2026.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

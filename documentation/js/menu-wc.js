'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">places-be documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AppModule-57b94759c06badfb61f16b0bbb38ab84cf2c254cbb1e42f9a7af8fe6b99488db2ffbfc8e30625cd3081507e4cbe820aef8e5d6c191e6f292930350d3fa67e0a6"' : 'data-bs-target="#xs-controllers-links-module-AppModule-57b94759c06badfb61f16b0bbb38ab84cf2c254cbb1e42f9a7af8fe6b99488db2ffbfc8e30625cd3081507e4cbe820aef8e5d6c191e6f292930350d3fa67e0a6"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-57b94759c06badfb61f16b0bbb38ab84cf2c254cbb1e42f9a7af8fe6b99488db2ffbfc8e30625cd3081507e4cbe820aef8e5d6c191e6f292930350d3fa67e0a6"' :
                                            'id="xs-controllers-links-module-AppModule-57b94759c06badfb61f16b0bbb38ab84cf2c254cbb1e42f9a7af8fe6b99488db2ffbfc8e30625cd3081507e4cbe820aef8e5d6c191e6f292930350d3fa67e0a6"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' : 'data-bs-target="#xs-controllers-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' :
                                            'id="xs-controllers-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' }>
                                            <li class="link">
                                                <a href="controllers/AuthController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' : 'data-bs-target="#xs-injectables-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' :
                                        'id="xs-injectables-links-module-AuthModule-838fd92290f4ad53be12508fbbe3531756dc1e8918d7134d4198cee745085d817fd629301feda672c6d668f0f0ffae7609e39860c4add997c65fc6ce47a130d6"' }>
                                        <li class="link">
                                            <a href="injectables/AuthService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PayloadFromTokenPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PayloadFromTokenPipe</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserFromTokenPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserFromTokenPipe</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/CommentsModule.html" data-type="entity-link" >CommentsModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-CommentsModule-cb6aacd752c437fdec1edb43887978a04e86b739510dd2dba1add9f158f1c8de28c774d44a0902dcb2ba17f694cab6bf647b23c1ff1ed74fa4faa26566b51800"' : 'data-bs-target="#xs-injectables-links-module-CommentsModule-cb6aacd752c437fdec1edb43887978a04e86b739510dd2dba1add9f158f1c8de28c774d44a0902dcb2ba17f694cab6bf647b23c1ff1ed74fa4faa26566b51800"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-CommentsModule-cb6aacd752c437fdec1edb43887978a04e86b739510dd2dba1add9f158f1c8de28c774d44a0902dcb2ba17f694cab6bf647b23c1ff1ed74fa4faa26566b51800"' :
                                        'id="xs-injectables-links-module-CommentsModule-cb6aacd752c437fdec1edb43887978a04e86b739510dd2dba1add9f158f1c8de28c774d44a0902dcb2ba17f694cab6bf647b23c1ff1ed74fa4faa26566b51800"' }>
                                        <li class="link">
                                            <a href="injectables/CommentsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CommentsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DatabaseModule.html" data-type="entity-link" >DatabaseModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/ImagesModule.html" data-type="entity-link" >ImagesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' : 'data-bs-target="#xs-controllers-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' :
                                            'id="xs-controllers-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' }>
                                            <li class="link">
                                                <a href="controllers/ImagesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImagesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' : 'data-bs-target="#xs-injectables-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' :
                                        'id="xs-injectables-links-module-ImagesModule-234fa552acfc79e544ac843c7bc4e7215ec6eef0899feb1d6adc4de4ff75f8b52a0476802393a281cfcbc1ccfcb424bb1b61afc08d01283f3ade8643e15ade1f"' }>
                                        <li class="link">
                                            <a href="injectables/ImagesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImagesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/LanguagesModule.html" data-type="entity-link" >LanguagesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' : 'data-bs-target="#xs-controllers-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' :
                                            'id="xs-controllers-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' }>
                                            <li class="link">
                                                <a href="controllers/LanguagesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LanguagesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' : 'data-bs-target="#xs-injectables-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' :
                                        'id="xs-injectables-links-module-LanguagesModule-e02144e6e8db1e1c0e2487aed6be5e2cdb91ab88452e8022972ebe76a523f87f3a2b9d0e7efcefdb14e737bb54bf7ac0b910c6840aafc67e59f47fa3f9cc25c0"' }>
                                        <li class="link">
                                            <a href="injectables/LanguagesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LanguagesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MailingModule.html" data-type="entity-link" >MailingModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-MailingModule-00439ef309a18b9f0fea2841f1d12329d04246bf340df3c71e8e440b0acc496f56af301688a323016f276a40b9d6578f26c88416e37e0bfc9c5dc1232c61bac9"' : 'data-bs-target="#xs-injectables-links-module-MailingModule-00439ef309a18b9f0fea2841f1d12329d04246bf340df3c71e8e440b0acc496f56af301688a323016f276a40b9d6578f26c88416e37e0bfc9c5dc1232c61bac9"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MailingModule-00439ef309a18b9f0fea2841f1d12329d04246bf340df3c71e8e440b0acc496f56af301688a323016f276a40b9d6578f26c88416e37e0bfc9c5dc1232c61bac9"' :
                                        'id="xs-injectables-links-module-MailingModule-00439ef309a18b9f0fea2841f1d12329d04246bf340df3c71e8e440b0acc496f56af301688a323016f276a40b9d6578f26c88416e37e0bfc9c5dc1232c61bac9"' }>
                                        <li class="link">
                                            <a href="injectables/MailingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MailingService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlaceCategoriesModule.html" data-type="entity-link" >PlaceCategoriesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' : 'data-bs-target="#xs-controllers-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' :
                                            'id="xs-controllers-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' }>
                                            <li class="link">
                                                <a href="controllers/PlaceCategoriesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaceCategoriesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' : 'data-bs-target="#xs-injectables-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' :
                                        'id="xs-injectables-links-module-PlaceCategoriesModule-5a3228222f747fd85df66bdd4e4905f54bcb3a41cd7f59db3fc8958a39cce1f2452d69249db7630ef6ad152990997b5c24e52fb547993b305411f2d9ca2ba799"' }>
                                        <li class="link">
                                            <a href="injectables/PlaceCategoriesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaceCategoriesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlacesModule.html" data-type="entity-link" >PlacesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' : 'data-bs-target="#xs-controllers-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' :
                                            'id="xs-controllers-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' }>
                                            <li class="link">
                                                <a href="controllers/PlacesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlacesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' : 'data-bs-target="#xs-injectables-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' :
                                        'id="xs-injectables-links-module-PlacesModule-0914d4b893239d641346ee39b0ca893fd4c39c4abfcc23ddb8d5639d6a75de994e651137cf0f75166c274a390684822fa9041df63fdc4cad04c664f7fa5df687"' }>
                                        <li class="link">
                                            <a href="injectables/PlacesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlacesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlaceTypesModule.html" data-type="entity-link" >PlaceTypesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' : 'data-bs-target="#xs-controllers-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' :
                                            'id="xs-controllers-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' }>
                                            <li class="link">
                                                <a href="controllers/PlaceTypesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaceTypesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' : 'data-bs-target="#xs-injectables-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' :
                                        'id="xs-injectables-links-module-PlaceTypesModule-e09f7fd01991dc66c3506ec51d4d8af4954067862c453b2d5c2d0ace6ba68010bdbf43ffc255e8ecc9c6ac12a3e04406339e944aaf5373a485bb497f315e448d"' }>
                                        <li class="link">
                                            <a href="injectables/PlaceTypesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PlaceTypesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/RolesModule.html" data-type="entity-link" >RolesModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' : 'data-bs-target="#xs-controllers-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' :
                                            'id="xs-controllers-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' }>
                                            <li class="link">
                                                <a href="controllers/RolesController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' : 'data-bs-target="#xs-injectables-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' :
                                        'id="xs-injectables-links-module-RolesModule-790e3f13ffac773f94eeea22382a50e84fcfb7fce4f410a621d6dd345531861a8f84f1ba7026bd5e9f1d5a785366bd8b1fadd4b0611ff0c09c93d197f63cec6f"' }>
                                        <li class="link">
                                            <a href="injectables/RolesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RolesService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/StorageModule.html" data-type="entity-link" >StorageModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-StorageModule-5455bc3d54edbf521f059e12fba6a4a2135ffb9a87966a1cb98ce796ae62de530d9e515d62bc2baebd9ca04e1d5dea1360f1b361b6717e37adec1fdfde63a553"' : 'data-bs-target="#xs-injectables-links-module-StorageModule-5455bc3d54edbf521f059e12fba6a4a2135ffb9a87966a1cb98ce796ae62de530d9e515d62bc2baebd9ca04e1d5dea1360f1b361b6717e37adec1fdfde63a553"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-StorageModule-5455bc3d54edbf521f059e12fba6a4a2135ffb9a87966a1cb98ce796ae62de530d9e515d62bc2baebd9ca04e1d5dea1360f1b361b6717e37adec1fdfde63a553"' :
                                        'id="xs-injectables-links-module-StorageModule-5455bc3d54edbf521f059e12fba6a4a2135ffb9a87966a1cb98ce796ae62de530d9e515d62bc2baebd9ca04e1d5dea1360f1b361b6717e37adec1fdfde63a553"' }>
                                        <li class="link">
                                            <a href="injectables/StorageService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StorageService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/TranslationsModule.html" data-type="entity-link" >TranslationsModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' : 'data-bs-target="#xs-controllers-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' :
                                            'id="xs-controllers-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' }>
                                            <li class="link">
                                                <a href="controllers/TranslationsController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TranslationsController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' : 'data-bs-target="#xs-injectables-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' :
                                        'id="xs-injectables-links-module-TranslationsModule-a3c82c3e3a380715da9e05711cd3f38faa272645d6289e8b4fcb942a4e3a9b53d59f90ffef0beb89620d1b9285ac7bff6d32fe10713730ccd364c48a0713872a"' }>
                                        <li class="link">
                                            <a href="injectables/TranslationsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TranslationsService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/UsersModule.html" data-type="entity-link" >UsersModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#controllers-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' : 'data-bs-target="#xs-controllers-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' :
                                            'id="xs-controllers-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' }>
                                            <li class="link">
                                                <a href="controllers/UsersController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' : 'data-bs-target="#xs-injectables-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' :
                                        'id="xs-injectables-links-module-UsersModule-184069e2b24d5ba18d269b954772baea7bec37b929bb626d06f0629ba9cd191526a2e720930eae2d3a0477865db967108829901d0e8958cbff79c1e470744ecb"' }>
                                        <li class="link">
                                            <a href="injectables/UsersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsersService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#controllers-links"' :
                                'data-bs-target="#xs-controllers-links"' }>
                                <span class="icon ion-md-swap"></span>
                                <span>Controllers</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="controllers-links"' : 'id="xs-controllers-links"' }>
                                <li class="link">
                                    <a href="controllers/AppController.html" data-type="entity-link" >AppController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/AuthController.html" data-type="entity-link" >AuthController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/ImagesController.html" data-type="entity-link" >ImagesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/LanguagesController.html" data-type="entity-link" >LanguagesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PlaceCategoriesController.html" data-type="entity-link" >PlaceCategoriesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PlacesController.html" data-type="entity-link" >PlacesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/PlaceTypesController.html" data-type="entity-link" >PlaceTypesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/RolesController.html" data-type="entity-link" >RolesController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/TranslationsController.html" data-type="entity-link" >TranslationsController</a>
                                </li>
                                <li class="link">
                                    <a href="controllers/UsersController.html" data-type="entity-link" >UsersController</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#entities-links"' :
                                'data-bs-target="#xs-entities-links"' }>
                                <span class="icon ion-ios-apps"></span>
                                <span>Entities</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="entities-links"' : 'id="xs-entities-links"' }>
                                <li class="link">
                                    <a href="entities/Admin.html" data-type="entity-link" >Admin</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Comment.html" data-type="entity-link" >Comment</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Image.html" data-type="entity-link" >Image</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Language.html" data-type="entity-link" >Language</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Like.html" data-type="entity-link" >Like</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Place.html" data-type="entity-link" >Place</a>
                                </li>
                                <li class="link">
                                    <a href="entities/PlaceCategory.html" data-type="entity-link" >PlaceCategory</a>
                                </li>
                                <li class="link">
                                    <a href="entities/PlaceType.html" data-type="entity-link" >PlaceType</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Role.html" data-type="entity-link" >Role</a>
                                </li>
                                <li class="link">
                                    <a href="entities/Translation.html" data-type="entity-link" >Translation</a>
                                </li>
                                <li class="link">
                                    <a href="entities/User.html" data-type="entity-link" >User</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AuthDto.html" data-type="entity-link" >AuthDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CommentDto.html" data-type="entity-link" >CommentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateCommentDto.html" data-type="entity-link" >CreateCommentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateFileDto.html" data-type="entity-link" >CreateFileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateImageDto.html" data-type="entity-link" >CreateImageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateLanguageDto.html" data-type="entity-link" >CreateLanguageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePlaceCategoryDto.html" data-type="entity-link" >CreatePlaceCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePlaceDto.html" data-type="entity-link" >CreatePlaceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreatePlaceTypeDto.html" data-type="entity-link" >CreatePlaceTypeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateRoleDto.html" data-type="entity-link" >CreateRoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateTranslationDto.html" data-type="entity-link" >CreateTranslationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/CreateUserDto.html" data-type="entity-link" >CreateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/FileDto.html" data-type="entity-link" >FileDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ImageDto.html" data-type="entity-link" >ImageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LanguageDto.html" data-type="entity-link" >LanguageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/LoginDto.html" data-type="entity-link" >LoginDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaceCategoryDto.html" data-type="entity-link" >PlaceCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaceDto.html" data-type="entity-link" >PlaceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaceSlugDto.html" data-type="entity-link" >PlaceSlugDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/PlaceTypeDto.html" data-type="entity-link" >PlaceTypeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/RoleDto.html" data-type="entity-link" >RoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/SearchPlaceDto.html" data-type="entity-link" >SearchPlaceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TokenPayloadDto.html" data-type="entity-link" >TokenPayloadDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/TranslationDto.html" data-type="entity-link" >TranslationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateCommentDto.html" data-type="entity-link" >UpdateCommentDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateLanguageDto.html" data-type="entity-link" >UpdateLanguageDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePlaceCategoryDto.html" data-type="entity-link" >UpdatePlaceCategoryDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePlaceDto.html" data-type="entity-link" >UpdatePlaceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdatePlaceTypeDto.html" data-type="entity-link" >UpdatePlaceTypeDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateRoleDto.html" data-type="entity-link" >UpdateRoleDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateTranslationDto.html" data-type="entity-link" >UpdateTranslationDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UpdateUserDto.html" data-type="entity-link" >UpdateUserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserDto.html" data-type="entity-link" >UserDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ValidationExceptionDto.html" data-type="entity-link" >ValidationExceptionDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/ValidationMessageDto.html" data-type="entity-link" >ValidationMessageDto</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CommentsService.html" data-type="entity-link" >CommentsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ImagesService.html" data-type="entity-link" >ImagesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LanguagesService.html" data-type="entity-link" >LanguagesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MailingService.html" data-type="entity-link" >MailingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PayloadFromTokenPipe.html" data-type="entity-link" >PayloadFromTokenPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlaceCategoriesService.html" data-type="entity-link" >PlaceCategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlacesService.html" data-type="entity-link" >PlacesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlaceTypesService.html" data-type="entity-link" >PlaceTypesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesService.html" data-type="entity-link" >RolesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TranslationsService.html" data-type="entity-link" >TranslationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserFromTokenPipe.html" data-type="entity-link" >UserFromTokenPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsersService.html" data-type="entity-link" >UsersService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/JwtAuthGuard.html" data-type="entity-link" >JwtAuthGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/RolesGuard.html" data-type="entity-link" >RolesGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/IDatabaseConfig.html" data-type="entity-link" >IDatabaseConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IGoogleCloudConfig.html" data-type="entity-link" >IGoogleCloudConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IJwtConfig.html" data-type="entity-link" >IJwtConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMailerConfig.html" data-type="entity-link" >IMailerConfig</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
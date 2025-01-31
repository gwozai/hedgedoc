/*
 * SPDX-FileCopyrightText: 2021 The HedgeDoc developers (see AUTHORS file)
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Inject, Injectable } from '@nestjs/common';
import { URL } from 'url';

import appConfiguration, { AppConfig } from '../config/app.config';
import authConfiguration, { AuthConfig } from '../config/auth.config';
import customizationConfiguration, {
  CustomizationConfig,
} from '../config/customization.config';
import externalServicesConfiguration, {
  ExternalServicesConfig,
} from '../config/external-services.config';
import { ConsoleLoggerService } from '../logger/console-logger.service';
import { getServerVersionFromPackageJson } from '../utils/serverVersion';
import {
  AuthProviderDto,
  AuthProviderType,
  BrandingDto,
  FrontendConfigDto,
  IframeCommunicationDto,
  SpecialUrlsDto,
} from './frontend-config.dto';

@Injectable()
export class FrontendConfigService {
  constructor(
    private readonly logger: ConsoleLoggerService,
    @Inject(appConfiguration.KEY)
    private appConfig: AppConfig,
    @Inject(authConfiguration.KEY)
    private authConfig: AuthConfig,
    @Inject(customizationConfiguration.KEY)
    private customizationConfig: CustomizationConfig,
    @Inject(externalServicesConfiguration.KEY)
    private externalServicesConfig: ExternalServicesConfig,
  ) {
    this.logger.setContext(FrontendConfigService.name);
  }

  async getFrontendConfig(): Promise<FrontendConfigDto> {
    return {
      // ToDo: use actual value here
      allowAnonymous: false,
      allowRegister: this.authConfig.local.enableRegister,
      authProviders: this.getAuthProviders(),
      branding: this.getBranding(),
      iframeCommunication: this.getIframeCommunication(),
      maxDocumentLength: this.appConfig.maxDocumentLength,
      plantUmlServer: this.externalServicesConfig.plantUmlServer
        ? new URL(this.externalServicesConfig.plantUmlServer)
        : undefined,
      specialUrls: this.getSpecialUrls(),
      useImageProxy: !!this.externalServicesConfig.imageProxy,
      version: await getServerVersionFromPackageJson(),
    };
  }

  private getAuthProviders(): AuthProviderDto[] {
    const providers: AuthProviderDto[] = [];
    if (this.authConfig.local.enableLogin) {
      providers.push({
        type: AuthProviderType.LOCAL,
      });
    }
    if (this.authConfig.dropbox.clientID) {
      providers.push({
        type: AuthProviderType.DROPBOX,
      });
    }
    if (this.authConfig.facebook.clientID) {
      providers.push({
        type: AuthProviderType.FACEBOOK,
      });
    }
    if (this.authConfig.github.clientID) {
      providers.push({
        type: AuthProviderType.GITHUB,
      });
    }
    if (this.authConfig.google.clientID) {
      providers.push({
        type: AuthProviderType.GOOGLE,
      });
    }
    if (this.authConfig.twitter.consumerKey) {
      providers.push({
        type: AuthProviderType.TWITTER,
      });
    }
    this.authConfig.gitlab.forEach((gitLabEntry) => {
      providers.push({
        type: AuthProviderType.GITLAB,
        providerName: gitLabEntry.providerName,
        identifier: gitLabEntry.identifier,
      });
    });
    this.authConfig.ldap.forEach((ldapEntry) => {
      providers.push({
        type: AuthProviderType.LDAP,
        providerName: ldapEntry.providerName,
        identifier: ldapEntry.identifier,
      });
    });
    this.authConfig.oauth2.forEach((oauth2Entry) => {
      providers.push({
        type: AuthProviderType.OAUTH2,
        providerName: oauth2Entry.providerName,
        identifier: oauth2Entry.identifier,
      });
    });
    this.authConfig.saml.forEach((samlEntry) => {
      providers.push({
        type: AuthProviderType.SAML,
        providerName: samlEntry.providerName,
        identifier: samlEntry.identifier,
      });
    });
    return providers;
  }

  private getBranding(): BrandingDto {
    return {
      logo: this.customizationConfig.branding.customLogo
        ? new URL(this.customizationConfig.branding.customLogo)
        : undefined,
      name: this.customizationConfig.branding.customName,
    };
  }

  private getSpecialUrls(): SpecialUrlsDto {
    return {
      imprint: this.customizationConfig.specialUrls.imprint
        ? new URL(this.customizationConfig.specialUrls.imprint)
        : undefined,
      privacy: this.customizationConfig.specialUrls.privacy
        ? new URL(this.customizationConfig.specialUrls.privacy)
        : undefined,
      termsOfUse: this.customizationConfig.specialUrls.termsOfUse
        ? new URL(this.customizationConfig.specialUrls.termsOfUse)
        : undefined,
    };
  }

  private getIframeCommunication(): IframeCommunicationDto {
    return {
      editorOrigin: new URL(this.appConfig.domain),
      rendererOrigin: new URL(this.appConfig.rendererOrigin),
    };
  }
}

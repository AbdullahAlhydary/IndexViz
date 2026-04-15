package com.indexing.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Web configuration: serves the React SPA from static resources.
 * All non-API, non-static-asset routes are forwarded to index.html
 * so that React Router can handle client-side routing.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requested = location.createRelative(resourcePath);
                        // If the file exists (JS, CSS, images), serve it directly.
                        // Otherwise, serve index.html for React Router to handle.
                        return requested.exists() && requested.isReadable()
                                ? requested
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }
}

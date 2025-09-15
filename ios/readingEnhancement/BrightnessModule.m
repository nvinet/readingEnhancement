#import <React/RCTBridgeModule.h>
#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

@interface BrightnessModule : NSObject <RCTBridgeModule>
@end

@implementation BrightnessModule

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

RCT_EXPORT_METHOD(setBrightness:(nonnull NSNumber *)value)
{
  CGFloat v = (CGFloat)MAX(0.0, MIN(1.0, [value doubleValue]));
  dispatch_async(dispatch_get_main_queue(), ^{
    [UIScreen mainScreen].brightness = v;
  });
}

RCT_REMAP_METHOD(getBrightness,
                 getBrightnessWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    resolve(@([UIScreen mainScreen].brightness));
  });
}

@end


